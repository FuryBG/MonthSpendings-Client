import { BottomSheet, BottomSheetRef, sheetStyles } from "@/components/BottomSheet";
import { ScreenContainer } from "@/components/ScreenContainer";
import {
    useAddBudgetCategoryMutation,
    useBudgetsQuery,
    useDeleteBudgetCategoryMutation,
    useDeleteBudgetMutation,
    useFinishBudgetMutation,
    useUpdateBudgetCategoryNameMutation,
} from "@/hooks/useBudgetQueries";
import { useSavingsPotsQuery } from "@/hooks/useSavingsQueries";
import { useAuthStore } from "@/stores/authStore";
import { useSnackbarStore } from "@/stores/snackbarStore";
import { useTitleStore } from "@/stores/titleStore";
import { BudgetCategory, BudgetInvite, Spending } from "@/types/Types";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
    Button,
    Card,
    Divider,
    HelperText,
    Icon,
    IconButton,
    List,
    Text,
    TextInput,
    useTheme,
} from "react-native-paper";
import { createInvite, respondToInvite } from "../services/api";

const COLOR_EXPENSE = '#F87171';
const COLOR_INCOME  = '#4ADE80';
const COLOR_AMBER   = '#F59E0B';

type SheetType = 'invite' | 'addCategory' | 'deleteCategory' | 'renameCategory' | 'deleteBudget' | 'finishPeriod' | null;

export default function ManageBudgetScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { data: budgets = [] } = useBudgetsQuery();
    const user = useAuthStore((s) => s.user);
    const restoreSession = useAuthStore((s) => s.restoreSession);
    const skipGlobal = { skipGlobalError: true };
    const deleteBudgetCategoryMutation = useDeleteBudgetCategoryMutation(skipGlobal);
    const addBudgetCategoryMutation = useAddBudgetCategoryMutation(skipGlobal);
    const deleteBudgetMutation = useDeleteBudgetMutation(skipGlobal);
    const finishBudgetMutation = useFinishBudgetMutation(skipGlobal);
    const updateCategoryNameMutation = useUpdateBudgetCategoryNameMutation(skipGlobal);
    const showError = useSnackbarStore((s) => s.showError);
    const showSuccess = useSnackbarStore((s) => s.showSuccess);
    const setTitle = useTitleStore((s) => s.setTitle);
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const [isDeletingBudget, setIsDeletingBudget] = useState(false);
    const { data: savingsPots = [] } = useSavingsPotsQuery();
    const [finishStep, setFinishStep] = useState<'choice' | 'selectPot'>('choice');
    const [selectedSavingsPotId, setSelectedSavingsPotId] = useState<number | null>(null);

    const sheetRef = useRef<BottomSheetRef>(null);
    const renameInputRef = useRef<any>(null);
    const [activeSheet, setActiveSheet] = useState<SheetType>(null);
    const [sheetVisible, setSheetVisible] = useState(false);
    const [confirmDeleteCategory, setConfirmDeleteCategory] = useState<BudgetCategory | null>(null);
    const [renameCategoryTarget, setRenameCategoryTarget] = useState<BudgetCategory | null>(null);

    useEffect(() => {
        if (activeSheet !== 'renameCategory') return;
        const t = setTimeout(() => renameInputRef.current?.focus(), 350);
        return () => clearTimeout(t);
    }, [activeSheet]);

    const selectedMainBudget = budgets.find(b => b.id == Number(params.budgetId));

    const { control, handleSubmit, reset } = useForm<BudgetCategory>({
        defaultValues: {
            id: 0,
            budgetId: selectedMainBudget?.id,
            name: "",
            spendings: [{
                id: 0,
                amount: undefined,
                description: "ADD MONEY",
                budgetCategoryId: 0,
            }],
        },
    });

    const { control: inviteControl, handleSubmit: inviteHandleSubmit, reset: inviteReset } = useForm<BudgetInvite>({
        defaultValues: {
            id: 0,
            budgetId: selectedMainBudget?.id ?? 0,
            receiverEmail: "",
        },
    });

    const { control: renameControl, handleSubmit: renameHandleSubmit, reset: renameReset, setValue: renameSetValue } = useForm<{ name: string }>({
        defaultValues: { name: '' },
    });

    function openSheet(type: SheetType, category?: BudgetCategory) {
        if (type === 'deleteCategory' && category) setConfirmDeleteCategory(category);
        if (type === 'renameCategory' && category) {
            setRenameCategoryTarget(category);
            renameSetValue('name', category.name);
        }
        if (type === 'finishPeriod') {
            setFinishStep('choice');
            setSelectedSavingsPotId(null);
        }
        setActiveSheet(type);
        setSheetVisible(true);
    }

    function handleSheetClose(onDone?: () => void) {
        setSheetVisible(false);
        setActiveSheet(null);
        onDone?.();
    }

    async function onDeleteCategory() {
        if (!confirmDeleteCategory) return;
        try {
            setLoading(true);
            await deleteBudgetCategoryMutation.mutateAsync(confirmDeleteCategory.id);
            sheetRef.current?.close(() => { setConfirmDeleteCategory(null); showSuccess("Category deleted."); });
        } catch {
            sheetRef.current?.close(() => showError("Deleting category was not successful."));
        } finally {
            setLoading(false);
        }
    }

    async function onDeleteBudget() {
        try {
            setLoading(true);
            setIsDeletingBudget(true);
            await deleteBudgetMutation.mutateAsync(selectedMainBudget!.id);
            sheetRef.current?.close(() => router.replace("/(main)/(drawer)/(tabs)"));
        } catch {
            setIsDeletingBudget(false);
            sheetRef.current?.close(() => showError("Deleting budget was not successful."));
        } finally {
            setLoading(false);
        }
    }

    async function onCreateCategory(budgetCategory: BudgetCategory) {
        try {
            setLoading(true);
            budgetCategory.budgetId = selectedMainBudget!.id;
            budgetCategory.spendings[0].budgetPeriodId = selectedMainBudget?.budgetPeriods[0].id ?? 0;
            await addBudgetCategoryMutation.mutateAsync(budgetCategory);
            sheetRef.current?.close(() => { reset(); showSuccess("Category created."); });
        } catch {
            sheetRef.current?.close(() => showError("Creating category was not successful."));
        } finally {
            setLoading(false);
        }
    }

    async function onRenameCategory({ name }: { name: string }) {
        if (!renameCategoryTarget) return;
        try {
            setLoading(true);
            await updateCategoryNameMutation.mutateAsync({ id: renameCategoryTarget.id, newName: name });
            sheetRef.current?.close(() => { renameReset(); showSuccess("Category renamed."); });
        } catch {
            sheetRef.current?.close(() => showError("Renaming category was not successful."));
        } finally {
            setLoading(false);
        }
    }

    async function onCreateInvite(budgetInvite: BudgetInvite) {
        try {
            setLoading(true);
            await createInvite(budgetInvite);
            sheetRef.current?.close(() => { inviteReset(); showSuccess("Invite sent."); });
        } catch {
            sheetRef.current?.close(() => showError("Sending invite was not successful."));
        } finally {
            setLoading(false);
        }
    }

    async function onFinishPeriod(savingsPotId?: number) {
        if (!selectedMainBudget) return;
        try {
            setLoading(true);
            const budgetToFinish = {
                ...selectedMainBudget,
                budgetCategories: selectedMainBudget.budgetCategories!.map(category => ({
                    ...category,
                    spendings: [{
                        id: 0,
                        budgetPeriodId: 0,
                        budgetCategoryId: category.id,
                        date: new Date().toISOString(),
                        amount: calculateRemaining(category.spendings),
                        bankTransaction: null,
                        bankTransactionId: null,
                        description: "MOVED TO NEXT PERIOD",
                    } as Spending],
                })),
            };
            await finishBudgetMutation.mutateAsync({ budget: budgetToFinish, savingsPotId });
            sheetRef.current?.close(() => showSuccess("Budget period finished successfully."));
        } catch {
            sheetRef.current?.close(() => showError("Finishing period was not successful."));
        } finally {
            setLoading(false);
        }
    }

    async function onRespondToInvite(inviteId: number, accepted: boolean) {
        try {
            setLoading(true);
            await respondToInvite(inviteId, accepted);
            await restoreSession();
            showSuccess(accepted ? "Invite accepted." : "Invite declined.");
        } catch {
            showError("Failed to respond to invite.");
        } finally {
            setLoading(false);
        }
    }

    const calculateRemaining = (spendings: Spending[]) =>
        spendings.reduce((sum, s) => s.amount > 0 ? sum + s.amount : sum - Math.abs(s.amount), 0);

    useFocusEffect(() => {
        setTitle("Budget Management");
    });

    const renderSheetContent = () => {
        if (activeSheet === 'invite') {
            return (
                <>
                    <Text style={sheetStyles.sheetTitle}>Invite Member</Text>
                    <Controller
                        control={inviteControl}
                        rules={{ required: "Email is required" }}
                        name="receiverEmail"
                        render={({ field: { onChange, value }, fieldState }) => (
                            <>
                                <TextInput
                                    label="Email address"
                                    value={value}
                                    onChangeText={onChange}
                                    error={fieldState.error != null}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    style={sheetStyles.sheetInput}
                                />
                                <HelperText type="error" visible={!!fieldState.error}>
                                    {fieldState.error?.message}
                                </HelperText>
                            </>
                        )}
                    />
                    <View style={sheetStyles.sheetActions}>
                        <Button mode="text" onPress={() => sheetRef.current?.close(inviteReset)}>Cancel</Button>
                        <Button mode="contained" loading={loading}
                            onPress={inviteHandleSubmit(onCreateInvite)}
                            contentStyle={sheetStyles.sheetConfirmContent}>
                            Send Invite
                        </Button>
                    </View>
                </>
            );
        }

        if (activeSheet === 'renameCategory') {
            return (
                <>
                    <Text style={sheetStyles.sheetTitle}>Rename — {renameCategoryTarget?.name}</Text>
                    <Controller
                        control={renameControl}
                        rules={{ required: "Name is required" }}
                        name="name"
                        render={({ field: { onChange, value }, fieldState }) => (
                            <>
                                <TextInput
                                    ref={renameInputRef}
                                    label="Category name"
                                    value={value}
                                    onChangeText={onChange}
                                    error={fieldState.error != null}
                                    style={sheetStyles.sheetInput}
                                />
                                <HelperText type="error" visible={!!fieldState.error}>
                                    {fieldState.error?.message}
                                </HelperText>
                            </>
                        )}
                    />
                    <View style={sheetStyles.sheetActions}>
                        <Button mode="text" onPress={() => sheetRef.current?.close(renameReset)}>Cancel</Button>
                        <Button mode="contained" loading={loading}
                            onPress={renameHandleSubmit(onRenameCategory)}
                            contentStyle={sheetStyles.sheetConfirmContent}>
                            Save
                        </Button>
                    </View>
                </>
            );
        }

        if (activeSheet === 'addCategory') {
            return (
                <>
                    <Text style={sheetStyles.sheetTitle}>Add Category</Text>
                    <Controller
                        control={control}
                        rules={{ required: "Name is required" }}
                        name="name"
                        render={({ field: { onChange, value }, fieldState }) => (
                            <>
                                <TextInput
                                    label="Category name"
                                    value={value}
                                    onChangeText={onChange}
                                    error={fieldState.error != null}
                                    style={sheetStyles.sheetInput}
                                />
                                <HelperText type="error" visible={!!fieldState.error}>
                                    {fieldState.error?.message}
                                </HelperText>
                            </>
                        )}
                    />
                    <Controller
                        control={control}
                        rules={{ required: "Starting amount is required" }}
                        name="spendings.0.amount"
                        render={({ field: { onChange, value }, fieldState }) => (
                            <>
                                <TextInput
                                    label="Starting amount"
                                    keyboardType="numeric"
                                    value={value ? value.toString() : ""}
                                    onChangeText={onChange}
                                    error={fieldState.error != null}
                                    style={sheetStyles.sheetInput}
                                />
                                <HelperText type="error" visible={!!fieldState.error}>
                                    {fieldState.error?.message}
                                </HelperText>
                            </>
                        )}
                    />
                    <View style={sheetStyles.sheetActions}>
                        <Button mode="text" onPress={() => sheetRef.current?.close(reset)}>Cancel</Button>
                        <Button mode="contained" loading={loading}
                            onPress={handleSubmit(onCreateCategory)}
                            contentStyle={sheetStyles.sheetConfirmContent}>
                            Create
                        </Button>
                    </View>
                </>
            );
        }

        if (activeSheet === 'deleteCategory') {
            return (
                <View style={sheetStyles.sheetCenteredContent}>
                    <View style={[sheetStyles.sheetConfirmIcon, { backgroundColor: 'rgba(248,113,113,0.12)' }]}>
                        <Icon source="trash-can-outline" size={28} color={COLOR_EXPENSE} />
                    </View>
                    <Text style={sheetStyles.sheetConfirmTitle}>Delete Category</Text>
                    <Text style={sheetStyles.sheetConfirmDesc}>
                        Delete "{confirmDeleteCategory?.name}"? All spending history for this category will be removed.
                    </Text>
                    <View style={sheetStyles.sheetActions}>
                        <Button mode="text" onPress={() => sheetRef.current?.close()}>Cancel</Button>
                        <Button mode="contained" buttonColor={COLOR_EXPENSE} textColor="#fff"
                            loading={loading} onPress={onDeleteCategory}
                            contentStyle={sheetStyles.sheetConfirmContent}>
                            Delete
                        </Button>
                    </View>
                </View>
            );
        }

        if (activeSheet === 'finishPeriod') {
            if (finishStep === 'choice') {
                return (
                    <View style={sheetStyles.sheetCenteredContent}>
                        <View style={[sheetStyles.sheetConfirmIcon, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                            <Icon source="calendar-check" size={28} color={COLOR_AMBER} />
                        </View>
                        <Text style={sheetStyles.sheetConfirmTitle}>Finish Budget Period</Text>
                        <Text style={sheetStyles.sheetConfirmDesc}>
                            What should happen with the remaining balance in "{selectedMainBudget?.name}"?
                        </Text>
                        <View style={{ width: '100%', gap: 10, marginBottom: 8 }}>
                            <Button
                                mode="contained"
                                buttonColor={COLOR_AMBER}
                                textColor="#0C0E12"
                                loading={loading}
                                onPress={() => onFinishPeriod(undefined)}
                                icon="arrow-right-circle-outline"
                            >
                                Carry over to new period
                            </Button>
                            <Button
                                mode="outlined"
                                textColor="#4ADE80"
                                loading={loading}
                                onPress={() => setFinishStep('selectPot')}
                                icon="piggy-bank-outline"
                            >
                                Move to savings pot
                            </Button>
                            <Button mode="text" onPress={() => sheetRef.current?.close()}>Cancel</Button>
                        </View>
                    </View>
                );
            }

            // Step 2: select savings pot
            const matchingPots = savingsPots.filter(
                p => p.currency.code === selectedMainBudget?.currency?.code
            );
            return (
                <>
                    <Text style={sheetStyles.sheetTitle}>Select Savings Pot</Text>
                    {matchingPots.length === 0 ? (
                        <View style={{ paddingVertical: 16, alignItems: 'center', gap: 8 }}>
                            <Icon source="piggy-bank-outline" size={28} color="#4ADE80" />
                            <Text style={{ textAlign: 'center', opacity: 0.6, fontSize: 13 }}>
                                No savings pots with {selectedMainBudget?.currency?.code} currency. Create one first.
                            </Text>
                        </View>
                    ) : (
                        matchingPots.map(pot => (
                            <TouchableOpacity
                                key={pot.id}
                                style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 12,
                                    borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 6,
                                    borderColor: selectedSavingsPotId === pot.id ? '#4ADE80' : theme.colors.surfaceVariant,
                                    backgroundColor: selectedSavingsPotId === pot.id ? 'rgba(74,222,128,0.08)' : 'transparent',
                                }}
                                onPress={() => setSelectedSavingsPotId(pot.id)}
                            >
                                <Icon source="piggy-bank-outline" size={20} color={selectedSavingsPotId === pot.id ? '#4ADE80' : theme.colors.onSurfaceVariant} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontWeight: '600', fontSize: 14 }}>{pot.name}</Text>
                                    <Text style={{ fontSize: 11, opacity: 0.55 }}>
                                        {pot.currency.symbol}{pot.totalSaved.toFixed(0)} saved
                                    </Text>
                                </View>
                                {selectedSavingsPotId === pot.id && <Icon source="check-circle" size={18} color="#4ADE80" />}
                            </TouchableOpacity>
                        ))
                    )}
                    <View style={sheetStyles.sheetActions}>
                        <Button mode="text" onPress={() => setFinishStep('choice')}>Back</Button>
                        <Button
                            mode="contained"
                            buttonColor="#4ADE80"
                            textColor="#0C0E12"
                            loading={loading}
                            disabled={!selectedSavingsPotId}
                            onPress={() => onFinishPeriod(selectedSavingsPotId ?? undefined)}
                            contentStyle={sheetStyles.sheetConfirmContent}
                        >
                            Confirm
                        </Button>
                    </View>
                </>
            );
        }

        if (activeSheet === 'deleteBudget') {
            return (
                <View style={sheetStyles.sheetCenteredContent}>
                    <View style={[sheetStyles.sheetConfirmIcon, { backgroundColor: 'rgba(248,113,113,0.12)' }]}>
                        <Icon source="trash-can-outline" size={28} color={COLOR_EXPENSE} />
                    </View>
                    <Text style={sheetStyles.sheetConfirmTitle}>Delete Budget</Text>
                    <Text style={sheetStyles.sheetConfirmDesc}>
                        Permanently delete "{selectedMainBudget?.name}"? All spending categories and their history will be lost. This cannot be undone.
                    </Text>
                    <View style={sheetStyles.sheetActions}>
                        <Button mode="text" onPress={() => sheetRef.current?.close()}>Cancel</Button>
                        <Button mode="contained" buttonColor={COLOR_EXPENSE} textColor="#fff"
                            loading={loading} onPress={onDeleteBudget}
                            contentStyle={sheetStyles.sheetConfirmContent}>
                            Delete
                        </Button>
                    </View>
                </View>
            );
        }

        return null;
    };

    return (
        <>
            <ScreenContainer scrollable={true}>

                {/* Header */}
                <Card style={styles.headerCard}>
                    <Card.Content style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            <Icon source="account-cash" size={28} color={theme.colors.primary} />
                            <Text style={styles.budgetName}>{selectedMainBudget?.name}</Text>
                        </View>
                        <View style={[styles.currencyBadge, { backgroundColor: theme.colors.primary }]}>
                            <Text style={[styles.currencyText, { color: theme.colors.onPrimary }]}>
                                {selectedMainBudget?.currency.symbol}
                            </Text>
                        </View>
                    </Card.Content>
                </Card>

                {/* Pending Invitations */}
                {(user?.receivedBudgetInvites.filter(i => i.accepted === null).length ?? 0) > 0 && (
                    <Card style={styles.sectionCard}>
                        <Card.Content>
                            <View style={styles.sectionTitleRow}>
                                <Text style={styles.sectionTitle}>Pending Invitations</Text>
                                <View style={[styles.inviteBadge, { backgroundColor: theme.colors.primary }]}>
                                    <Text style={[styles.inviteBadgeText, { color: theme.colors.onPrimary }]}>
                                        {user!.receivedBudgetInvites.filter(i => i.accepted === null).length}
                                    </Text>
                                </View>
                            </View>
                            <Divider style={styles.divider} />
                            {user!.receivedBudgetInvites.filter(i => i.accepted === null).map(invite => (
                                <View key={invite.id} style={styles.inviteRow}>
                                    <View style={styles.inviteInfo}>
                                        <View style={styles.inviteIconWrap}>
                                            <Icon source="email-outline" size={18} color={theme.colors.primary} />
                                        </View>
                                        <View style={{ flex: 1, marginRight: 8 }}>
                                            <Text style={styles.inviteTitle}>{invite.budgetName}</Text>
                                            <Text style={styles.inviteSubtitle}>
                                                {invite.senderName} ({invite.senderEmail})
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.inviteActions}>
                                        <TouchableOpacity
                                            style={[styles.inviteBtn, styles.inviteAccept]}
                                            onPress={() => onRespondToInvite(invite.id, true)}
                                        >
                                            <Icon source="check" size={16} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.inviteBtn, styles.inviteDecline]}
                                            onPress={() => onRespondToInvite(invite.id, false)}
                                        >
                                            <Icon source="close" size={16} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </Card.Content>
                    </Card>
                )}

                {/* Members */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Members</Text>
                        <Divider style={styles.divider} />
                        {selectedMainBudget?.users?.map(member => (
                            <View key={member.id} style={styles.memberRow}>
                                <Icon source="account-circle" size={24} color={theme.colors.onSurfaceVariant} />
                                <View style={styles.memberInfo}>
                                    <Text style={styles.memberEmail} numberOfLines={1}>{member.email}</Text>
                                    {(member.firstName || member.lastName) && (
                                        <Text style={styles.memberName}>
                                            {`${member.firstName} ${member.lastName}`.trim()}
                                        </Text>
                                    )}
                                </View>
                                {member.id === user?.id && (
                                    <View style={[styles.youBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                                        <Text style={[styles.youBadgeText, { color: theme.colors.onPrimaryContainer }]}>You</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                        <Divider style={styles.divider} />
                        <TouchableOpacity style={styles.actionRow} onPress={() => openSheet('invite')}>
                            <Icon source="account-plus" size={20} color={theme.colors.primary} />
                            <Text style={[styles.actionRowText, { color: theme.colors.primary }]}>
                                Invite Member
                            </Text>
                        </TouchableOpacity>
                    </Card.Content>
                </Card>

                {/* Categories */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Categories</Text>
                        <Divider style={styles.divider} />
                        {selectedMainBudget?.budgetCategories?.map(bc => (
                            <List.Item
                                key={bc.id}
                                title={bc.name}
                                left={props => <List.Icon {...props} icon="cash-fast" />}
                                right={() => (
                                    <View style={styles.categoryItemActions}>
                                        <IconButton
                                            icon="pencil-outline"
                                            size={18}
                                            onPress={() => openSheet('renameCategory', bc)}
                                        />
                                        <IconButton
                                            icon="trash-can-outline"
                                            size={18}
                                            iconColor={COLOR_EXPENSE}
                                            onPress={() => openSheet('deleteCategory', bc)}
                                        />
                                    </View>
                                )}
                            />
                        ))}
                        <Divider style={styles.divider} />
                        <Button
                            mode="outlined"
                            icon="plus"
                            onPress={() => openSheet('addCategory')}
                            style={styles.addCategoryButton}
                        >
                            Add Category
                        </Button>
                    </Card.Content>
                </Card>

                {/* Period */}
                <Card style={[styles.sectionCard, styles.periodCard]}>
                    <Card.Content>
                        <View style={styles.sectionTitleRow}>
                            <Icon source="calendar-month" size={18} color={COLOR_AMBER} />
                            <Text style={[styles.sectionTitle, { color: COLOR_AMBER, marginBottom: 0, marginLeft: 6 }]}>
                                Budget Period
                            </Text>
                        </View>
                        <Text style={styles.sectionDescription}>
                            Closes the current period. Remaining funds in each category are carried over to the next period.
                        </Text>
                        <Button
                            mode="contained"
                            buttonColor={COLOR_AMBER}
                            textColor="#0C0E12"
                            style={styles.periodButton}
                            onPress={() => openSheet('finishPeriod')}
                        >
                            Finish Period
                        </Button>
                    </Card.Content>
                </Card>

                {/* Delete Budget */}
                <View style={styles.deleteSection}>
                    <Divider style={styles.deleteDivider} />
                    <TouchableOpacity style={styles.deleteRow} onPress={() => openSheet('deleteBudget')}>
                        <View style={styles.deleteRowLeft}>
                            <View style={styles.deleteIconWrap}>
                                <Icon source="trash-can-outline" size={20} color={COLOR_EXPENSE} />
                            </View>
                            <View>
                                <Text style={styles.deleteLabel}>Delete Budget</Text>
                                <Text style={styles.deleteSubLabel}>Removes all categories and history</Text>
                            </View>
                        </View>
                        <Icon source="chevron-right" size={20} color={COLOR_EXPENSE} />
                    </TouchableOpacity>
                </View>

            </ScreenContainer>

            {/* Single shared bottom sheet */}
            <BottomSheet ref={sheetRef} visible={sheetVisible} onClose={handleSheetClose}>
                {renderSheetContent()}
            </BottomSheet>
        </>
    );
}

const styles = StyleSheet.create({
    headerCard: {
        borderRadius: 16,
        marginBottom: 12,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    budgetName: {
        fontSize: 20,
        fontWeight: '700',
    },
    currencyBadge: {
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    currencyText: {
        fontWeight: '700',
        fontSize: 14,
    },
    sectionCard: {
        borderRadius: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 4,
        opacity: 0.6,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 13,
        opacity: 0.6,
        lineHeight: 18,
        marginBottom: 12,
    },
    divider: {
        marginVertical: 8,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    memberInfo: {
        flex: 1,
    },
    memberEmail: {
        fontSize: 14,
    },
    memberName: {
        fontSize: 12,
        opacity: 0.5,
        marginTop: 1,
    },
    youBadge: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        flexShrink: 0,
    },
    youBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
    },
    actionRowText: {
        fontSize: 15,
        fontWeight: '600',
    },
    inviteBadge: {
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
    },
    inviteBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    inviteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    inviteInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    inviteIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: 'rgba(186,218,85,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inviteTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    inviteSubtitle: {
        fontSize: 12,
        opacity: 0.5,
    },
    inviteStatusBadge: {
        borderRadius: 20,
        padding: 6,
    },
    inviteActions: {
        flexDirection: 'row',
        gap: 8,
    },
    inviteBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inviteAccept: {
        backgroundColor: '#4ADE80',
    },
    inviteDecline: {
        backgroundColor: '#F87171',
    },
    categoryItemActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addCategoryButton: {
        marginTop: 4,
        borderRadius: 10,
    },
    periodCard: {
        borderColor: COLOR_AMBER,
        borderWidth: 1,
    },
    periodButton: {
        borderRadius: 10,
    },
    deleteSection: {
        marginBottom: 32,
    },
    deleteDivider: {
        marginBottom: 4,
    },
    deleteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 4,
    },
    deleteRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    deleteIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(248,113,113,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: COLOR_EXPENSE,
    },
    deleteSubLabel: {
        fontSize: 12,
        opacity: 0.5,
        marginTop: 1,
    },
});
