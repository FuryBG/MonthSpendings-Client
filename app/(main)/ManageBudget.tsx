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
import { useAuthStore } from "@/stores/authStore";
import { useSnackbarStore } from "@/stores/snackbarStore";
import { useTitleStore } from "@/stores/titleStore";
import { BudgetCategory, BudgetInvite, Spending } from "@/types/Types";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
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
    const setTitle = useTitleStore((s) => s.setTitle);
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(false);

    const sheetRef = useRef<BottomSheetRef>(null);
    const [activeSheet, setActiveSheet] = useState<SheetType>(null);
    const [sheetVisible, setSheetVisible] = useState(false);
    const [confirmDeleteCategory, setConfirmDeleteCategory] = useState<BudgetCategory | null>(null);
    const [renameCategoryTarget, setRenameCategoryTarget] = useState<BudgetCategory | null>(null);

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
            sheetRef.current?.close(() => setConfirmDeleteCategory(null));
        } catch {
            showError("Deleting category was not successful.");
        } finally {
            setLoading(false);
        }
    }

    async function onDeleteBudget() {
        try {
            setLoading(true);
            await deleteBudgetMutation.mutateAsync(selectedMainBudget!.id);
            sheetRef.current?.close(() => router.push("/(main)/(drawer)/(tabs)"));
        } catch {
            showError("Deleting budget was not successful.");
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
            sheetRef.current?.close(reset);
        } catch {
            showError("Creating category was not successful.");
        } finally {
            setLoading(false);
        }
    }

    async function onRenameCategory({ name }: { name: string }) {
        if (!renameCategoryTarget) return;
        try {
            setLoading(true);
            await updateCategoryNameMutation.mutateAsync({ id: renameCategoryTarget.id, newName: name });
            sheetRef.current?.close(renameReset);
        } catch {
            showError("Renaming category was not successful.");
        } finally {
            setLoading(false);
        }
    }

    async function onCreateInvite(budgetInvite: BudgetInvite) {
        try {
            setLoading(true);
            await createInvite(budgetInvite);
            sheetRef.current?.close(inviteReset);
        } catch {
            showError("Sending invite was not successful.");
        } finally {
            setLoading(false);
        }
    }

    async function onFinishPeriod() {
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
            await finishBudgetMutation.mutateAsync(budgetToFinish);
            sheetRef.current?.close();
        } catch {
            showError("Finishing period was not successful.");
        } finally {
            setLoading(false);
        }
    }

    async function onRespondToInvite(inviteId: number, accepted: boolean) {
        try {
            setLoading(true);
            await respondToInvite(inviteId, accepted);
            await restoreSession();
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
                                    label="Category name"
                                    value={value}
                                    onChangeText={onChange}
                                    error={fieldState.error != null}
                                    style={sheetStyles.sheetInput}
                                    autoFocus
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
            return (
                <View style={sheetStyles.sheetCenteredContent}>
                    <View style={[sheetStyles.sheetConfirmIcon, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                        <Icon source="calendar-check" size={28} color={COLOR_AMBER} />
                    </View>
                    <Text style={sheetStyles.sheetConfirmTitle}>Finish Budget Period</Text>
                    <Text style={sheetStyles.sheetConfirmDesc}>
                        Close the current period for "{selectedMainBudget?.name}"? Remaining funds in all categories will be carried over to the next period.
                    </Text>
                    <View style={sheetStyles.sheetActions}>
                        <Button mode="text" onPress={() => sheetRef.current?.close()}>Cancel</Button>
                        <Button mode="contained" buttonColor={COLOR_AMBER} textColor="#0C0E12"
                            loading={loading} onPress={onFinishPeriod}
                            contentStyle={sheetStyles.sheetConfirmContent}>
                            Confirm
                        </Button>
                    </View>
                </View>
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
                {(user?.receivedBudgetInvites.length ?? 0) > 0 && (
                    <Card style={styles.sectionCard}>
                        <Card.Content>
                            <View style={styles.sectionTitleRow}>
                                <Text style={styles.sectionTitle}>Pending Invitations</Text>
                                <View style={[styles.inviteBadge, { backgroundColor: theme.colors.primary }]}>
                                    <Text style={[styles.inviteBadgeText, { color: theme.colors.onPrimary }]}>
                                        {user!.receivedBudgetInvites.length}
                                    </Text>
                                </View>
                            </View>
                            <Divider style={styles.divider} />
                            {user!.receivedBudgetInvites.map(invite => (
                                <View key={invite.id} style={styles.inviteRow}>
                                    <View style={styles.inviteInfo}>
                                        <View style={styles.inviteIconWrap}>
                                            <Icon source="email-outline" size={18} color={theme.colors.primary} />
                                        </View>
                                        <View>
                                            <Text style={styles.inviteTitle}>Budget Invitation</Text>
                                            <Text style={styles.inviteSubtitle}>#{invite.budgetId}</Text>
                                        </View>
                                    </View>
                                    {invite.accepted != null
                                        ? <View style={[styles.inviteStatusBadge, {
                                            backgroundColor: invite.accepted
                                                ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                                        }]}>
                                            <Icon
                                                source={invite.accepted ? "check" : "close"}
                                                size={14}
                                                color={invite.accepted ? COLOR_INCOME : COLOR_EXPENSE}
                                            />
                                        </View>
                                        : <View style={styles.inviteActions}>
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
                                    }
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
                        <List.Item
                            title={user?.email}
                            titleStyle={styles.memberEmail}
                            left={props => <List.Icon {...props} icon="account-circle" />}
                        />
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
    memberEmail: {
        fontSize: 14,
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
