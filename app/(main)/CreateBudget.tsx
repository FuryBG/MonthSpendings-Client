import { BottomSheet, BottomSheetRef, sheetStyles } from '@/components/BottomSheet';
import { OverlayLoader } from '@/components/OverlayLoader';
import { useCreateBudgetMutation } from '@/hooks/useBudgetQueries';
import { useCurrenciesQuery } from '@/hooks/useCurrencyQueries';
import { useBudgetUIStore } from '@/stores/budgetUIStore';
import { Budget, Currency } from '@/types/Types';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { HelperText, Icon, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreateBudgetScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const createBudgetMutation = useCreateBudgetMutation();
    const { data: currencies = [] } = useCurrenciesQuery();
    const { setMainBudget } = useBudgetUIStore();

    const currencySheetRef = useRef<BottomSheetRef>(null);
    const [currencySheetVisible, setCurrencySheetVisible] = useState(false);
    const [currencySearch, setCurrencySearch] = useState('');

    const { control, handleSubmit, watch, reset, setValue } = useForm<Budget>({
        defaultValues: {
            id: 0,
            name: '',
            users: null,
            currency: { code: '', name: '', symbol: '' },
            budgetCategories: [{
                id: 0,
                name: '',
                budgetId: 0,
                spendings: [{
                    id: 0,
                    amount: undefined as any,
                    description: 'ADD MONEY',
                    budgetCategoryId: 0,
                    budgetPeriodId: 0,
                }],
            }],
        },
    });

    const selectedCurrencyCode = watch('currency.code');
    const selectedCurrency = currencies.find(c => c.code === selectedCurrencyCode);

    const { fields: categories, append: addCategory, remove } = useFieldArray({
        control,
        name: 'budgetCategories',
    });

    async function onSubmit(data: Budget) {
        try {
            data.currency = currencies.find(c => c.code === data.currency.code)!;
            const budget = await createBudgetMutation.mutateAsync(data);
            await setMainBudget(budget.id);
            reset();
            router.push('/(main)/(drawer)/(tabs)');
        } catch {
            // global snackbar handles errors
        }
    }

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    style={[styles.createBtn, { backgroundColor: theme.colors.primary }]}
                    onPress={handleSubmit(onSubmit)}
                >
                    <Text style={[styles.createBtnText, { color: theme.colors.onPrimary }]}>Create</Text>
                </TouchableOpacity>
            ),
        });
    }, [handleSubmit]);

    function selectCurrency(c: Currency) {
        setValue('currency.code', c.code);
        currencySheetRef.current?.close(() => {
            setCurrencySheetVisible(false);
            setCurrencySearch('');
        });
    }

    const filteredCurrencies = currencies.filter(c =>
        c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
        c.name.toLowerCase().includes(currencySearch.toLowerCase())
    );

    return (
        <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
            <OverlayLoader isVisible={createBudgetMutation.isPending} message="Creating budget..." />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={[styles.sectionLabel, { color: theme.colors.onBackground }]}>BUDGET DETAILS</Text>
                <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                    <Controller
                        control={control}
                        rules={{ required: 'Budget name is required' }}
                        name="name"
                        render={({ field: { onChange, value }, fieldState }) => (
                            <>
                                <TextInput
                                    label="Budget name"
                                    value={value}
                                    onChangeText={onChange}
                                    error={fieldState.error != null}
                                    mode="outlined"
                                    style={styles.input}
                                />
                                <HelperText type="error" visible={!!fieldState.error}>
                                    {fieldState.error?.message}
                                </HelperText>
                            </>
                        )}
                    />

                    <Controller
                        control={control}
                        rules={{ required: 'Currency is required' }}
                        name="currency.code"
                        render={({ field: { value }, fieldState }) => (
                            <>
                                <TouchableOpacity
                                    style={[
                                        styles.currencyButton,
                                        {
                                            borderColor: fieldState.error ? theme.colors.error : theme.colors.outline,
                                            backgroundColor: theme.colors.surfaceVariant,
                                        },
                                    ]}
                                    onPress={() => setCurrencySheetVisible(true)}
                                >
                                    <View style={styles.currencyLeft}>
                                        <View style={[
                                            styles.symbolBadge,
                                            { backgroundColor: selectedCurrency ? theme.colors.primary : theme.colors.outline },
                                        ]}>
                                            {selectedCurrency
                                                ? <Text style={[styles.symbolText, { color: theme.colors.onPrimary }]}>{selectedCurrency.symbol}</Text>
                                                : <Icon source="currency-usd" size={16} color={theme.colors.onSurface} />
                                            }
                                        </View>
                                        {selectedCurrency ? (
                                            <View>
                                                <Text style={[styles.currencyCode, { color: theme.colors.onSurface }]}>{selectedCurrency.code}</Text>
                                                <Text style={[styles.currencyName, { color: theme.colors.onSurface }]}>{selectedCurrency.name}</Text>
                                            </View>
                                        ) : (
                                            <Text style={[styles.currencyPlaceholder, { color: theme.colors.onSurface }]}>Select currency</Text>
                                        )}
                                    </View>
                                    <Icon source="chevron-down" size={20} color={theme.colors.onSurface} />
                                </TouchableOpacity>
                                <HelperText type="error" visible={!!fieldState.error}>
                                    {fieldState.error?.message}
                                </HelperText>
                            </>
                        )}
                    />
                </View>

                <View style={styles.sectionRow}>
                    <Text style={[styles.sectionLabel, { color: theme.colors.onBackground }]}>CATEGORIES</Text>
                    <View style={[styles.countBadge, { backgroundColor: theme.colors.primary }]}>
                        <Text style={[styles.countText, { color: theme.colors.onPrimary }]}>{categories.length}</Text>
                    </View>
                </View>

                {categories.map((cat, index) => (
                    <View
                        key={cat.id}
                        style={[styles.categoryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
                    >
                        <View style={styles.categoryHeader}>
                            <Text style={[styles.categoryIndex, { color: theme.colors.primary }]}>#{index + 1}</Text>
                            {categories.length > 1 && (
                                <IconButton
                                    icon="close"
                                    size={16}
                                    iconColor={theme.colors.error}
                                    style={styles.removeBtn}
                                    onPress={() => remove(index)}
                                />
                            )}
                        </View>
                        <View style={styles.categoryFields}>
                            <Controller
                                control={control}
                                rules={{ required: 'Required' }}
                                name={`budgetCategories.${index}.name`}
                                render={({ field: { onChange, value }, fieldState }) => (
                                    <View style={styles.nameField}>
                                        <TextInput
                                            label="Name"
                                            value={value}
                                            onChangeText={onChange}
                                            error={fieldState.error != null}
                                            mode="outlined"
                                            dense
                                        />
                                        <HelperText type="error" visible={!!fieldState.error} style={styles.denseHelper}>
                                            {fieldState.error?.message}
                                        </HelperText>
                                    </View>
                                )}
                            />
                            <Controller
                                control={control}
                                rules={{ required: 'Required' }}
                                name={`budgetCategories.${index}.spendings.0.amount`}
                                render={({ field: { onChange, value }, fieldState }) => (
                                    <View style={styles.amountField}>
                                        <TextInput
                                            label={selectedCurrencyCode || 'Amount'}
                                            keyboardType="numeric"
                                            value={value ? value.toString() : ''}
                                            onChangeText={onChange}
                                            error={fieldState.error != null}
                                            mode="outlined"
                                            dense
                                        />
                                        <HelperText type="error" visible={!!fieldState.error} style={styles.denseHelper}>
                                            {fieldState.error?.message}
                                        </HelperText>
                                    </View>
                                )}
                            />
                        </View>
                    </View>
                ))}

                <TouchableOpacity
                    style={[styles.addCategoryBtn, { borderColor: theme.colors.primary }]}
                    onPress={() => addCategory({
                        id: 0,
                        name: '',
                        budgetId: 0,
                        spendings: [{
                            id: 0,
                            amount: undefined as any,
                            date: null,
                            budgetCategoryId: 0,
                            budgetPeriodId: 0,
                            description: 'ADD MONEY',
                            bankTransaction: null,
                            bankTransactionId: null,
                        }],
                    })}
                >
                    <Icon source="plus" size={18} color={theme.colors.primary} />
                    <Text style={[styles.addCategoryText, { color: theme.colors.primary }]}>Add Category</Text>
                </TouchableOpacity>
            </ScrollView>

            <BottomSheet
                ref={currencySheetRef}
                visible={currencySheetVisible}
                onClose={(done) => { setCurrencySheetVisible(false); setCurrencySearch(''); done?.(); }}
            >
                <Text style={sheetStyles.sheetTitle}>Select Currency</Text>
                <TextInput
                    value={currencySearch}
                    onChangeText={setCurrencySearch}
                    placeholder="Search..."
                    dense
                    mode="outlined"
                    left={<TextInput.Icon icon="magnify" />}
                    style={styles.searchInput}
                />
                <ScrollView style={styles.currencyList} keyboardShouldPersistTaps="handled">
                    {filteredCurrencies.map(c => {
                        const isSelected = c.code === selectedCurrencyCode;
                        return (
                            <TouchableOpacity
                                key={c.id}
                                style={[
                                    styles.currencyRow,
                                    { borderBottomColor: theme.colors.outline },
                                    isSelected && { backgroundColor: theme.colors.secondaryContainer },
                                ]}
                                onPress={() => selectCurrency(c)}
                            >
                                <View style={[
                                    styles.symbolBadge,
                                    { backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceVariant },
                                ]}>
                                    <Text style={[
                                        styles.symbolText,
                                        { color: isSelected ? theme.colors.onPrimary : theme.colors.onSurface },
                                    ]}>
                                        {c.symbol}
                                    </Text>
                                </View>
                                <View style={styles.currencyRowInfo}>
                                    <Text style={[styles.currencyCode, { color: theme.colors.onSurface }]}>{c.code}</Text>
                                    <Text style={[styles.currencyName, { color: theme.colors.onSurface }]}>{c.name}</Text>
                                </View>
                                {isSelected && <Icon source="check" size={18} color={theme.colors.primary} />}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </BottomSheet>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    createBtn: { borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8, marginRight: 4 },
    createBtnText: { fontWeight: '700', fontSize: 14 },
    scroll: { flex: 1 },
    content: { padding: 16, gap: 8 },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        opacity: 0.5,
        marginTop: 12,
        marginBottom: 4,
    },
    sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, marginBottom: 4 },
    countBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 1 },
    countText: { fontSize: 11, fontWeight: '700' },
    card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 4 },
    input: { backgroundColor: 'transparent' },
    currencyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginTop: 4,
    },
    currencyLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    symbolBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    symbolText: { fontWeight: '700', fontSize: 15 },
    currencyCode: { fontSize: 15, fontWeight: '600' },
    currencyName: { fontSize: 12, opacity: 0.6 },
    currencyPlaceholder: { fontSize: 15, opacity: 0.5 },
    categoryCard: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 14, marginBottom: 8 },
    categoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    categoryIndex: { fontSize: 13, fontWeight: '700' },
    removeBtn: { margin: 0 },
    categoryFields: { flexDirection: 'row', gap: 10 },
    nameField: { flex: 3 },
    amountField: { flex: 2 },
    denseHelper: { fontSize: 10, minHeight: 16 },
    addCategoryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: 14,
        marginTop: 4,
    },
    addCategoryText: { fontWeight: '600', fontSize: 14 },
    searchInput: { marginBottom: 12, backgroundColor: 'transparent' },
    currencyList: { maxHeight: 280 },
    currencyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    currencyRowInfo: { flex: 1 },
});
