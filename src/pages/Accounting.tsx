import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Download, TrendingUp, TrendingDown, DollarSign, CreditCard, Banknote, FileText, Calculator, Users, Building, BookOpen, BarChart3, PieChart, Receipt, Archive, Settings, Filter, Calendar, Globe, Lock, CheckCircle, AlertCircle, Clock, Printer, Mail } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  account: string;
  debit: number;
  credit: number;
  balance: number;
  reference: string;
  type: 'income' | 'expense' | 'transfer';
  partner?: string;
  tags?: string[];
  analyticsAccount?: string;
  currency?: string;
  exchangeRate?: number;
}

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset_receivable' | 'asset_payable' | 'asset_cash' | 'asset_current' | 'asset_non_current' | 'asset_prepayments' | 'asset_fixed' | 'liability_payable' | 'liability_current' | 'liability_non_current' | 'equity' | 'equity_unaffected' | 'income' | 'income_other' | 'expense' | 'expense_depreciation' | 'expense_direct_cost';
  balance: number;
  parentAccount?: string;
  isActive: boolean;
  reconcile: boolean;
  deprecated?: boolean;
  currency?: string;
  company?: string;
  group?: string;
  note?: string;
  taxIds?: string[];
  tagIds?: string[];
}

interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  journal: string;
  entries: Array<{
    account: string;
    accountCode: string;
    debit: number;
    credit: number;
    partner?: string;
    name: string;
    analyticsAccount?: string;
    taxIds?: string[];
  }>;
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted' | 'cancelled';
  company?: string;
  currency?: string;
  exchangeRate?: number;
  narration?: string;
  reviewedBy?: string;
  postedBy?: string;
  postedDate?: string;
}

interface Journal {
  id: string;
  name: string;
  code: string;
  type: 'sale' | 'purchase' | 'cash' | 'bank' | 'general' | 'situation';
  defaultAccount?: string;
  sequence?: number;
  isActive: boolean;
  currency?: string;
  company?: string;
}

interface PaymentTerm {
  id: string;
  name: string;
  note?: string;
  active: boolean;
  company?: string;
  terms: Array<{
    value: 'balance' | 'percent' | 'fixed';
    valueAmount?: number;
    days: number;
    dayOfMonth?: number;
  }>;
}

interface FiscalPosition {
  id: string;
  name: string;
  note?: string;
  active: boolean;
  autoApply: boolean;
  vatRequired: boolean;
  country?: string;
  state?: string;
  zipFrom?: string;
  zipTo?: string;
  accountMapping: Array<{
    accountSrc: string;
    accountDest: string;
  }>;
  taxMapping: Array<{
    taxSrc: string;
    taxDest: string;
  }>;
}

interface TaxConfiguration {
  id: string;
  name: string;
  amount: number;
  amountType: 'percent' | 'fixed' | 'group';
  typeUse: 'sale' | 'purchase' | 'none';
  scope: 'service' | 'consu';
  active: boolean;
  sequence: number;
  description?: string;
  priceInclude: boolean;
  includeBaseAmount: boolean;
  isBaseAffected: boolean;
  analytic: boolean;
  company?: string;
  repartitionLines: Array<{
    factorPercent: number;
    repartitionType: 'tax' | 'base';
    accountId?: string;
    tagIds?: string[];
  }>;
}

interface BankReconciliation {
  id: string;
  date: string;
  statementName: string;
  bankAccount: string;
  startingBalance: number;
  endingBalance: number;
  status: 'draft' | 'open' | 'closed';
  transactions: Array<{
    id: string;
    date: string;
    ref: string;
    description: string;
    amount: number;
    matched: boolean;
    partner?: string;
  }>;
}

interface AnalyticAccount {
  id: string;
  name: string;
  code?: string;
  active: boolean;
  company?: string;
  partner?: string;
  balance: number;
  debit: number;
  credit: number;
}

interface Budget {
  id: string;
  name: string;
  dateFrom: string;
  dateTo: string;
  state: 'draft' | 'confirm' | 'validate' | 'done' | 'cancel';
  budgetLines: Array<{
    id: string;
    analyticAccount: string;
    dateFrom: string;
    dateTo: string;
    plannedAmount: number;
    practicalAmount: number;
    theoreticalAmount: number;
    percentage: number;
  }>;
}

interface CashBasisTax {
  id: string;
  name: string;
  transitionAccount: string;
  active: boolean;
  exigibility: 'on_invoice' | 'on_payment';
}

interface FixedAsset {
  id: string;
  name: string;
  code?: string;
  category: string;
  acquisitionDate: string;
  acquisitionValue: number;
  depreciationMethod: 'linear' | 'accelerated' | 'manual';
  depreciationYears: number;
  depreciationRate: number;
  currentValue: number;
  accumulatedDepreciation: number;
  status: 'draft' | 'running' | 'disposed';
  company?: string;
}

interface MultiCurrency {
  id: string;
  name: string;
  symbol: string;
  position: 'before' | 'after';
  rounding: number;
  active: boolean;
  rates: Array<{
    date: string;
    rate: number;
    inverseRate: number;
  }>;
}

interface FollowUpLevel {
  id: string;
  name: string;
  delay: number;
  description?: string;
  printLetter: boolean;
  sendEmail: boolean;
  sendSMS: boolean;
  manualAction: boolean;
  active: boolean;
}

export default function Accounting() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'accounts' | 'journal' | 'reconciliation' | 'reports' | 'taxes' | 'analytics' | 'settings'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [dateRange, setDateRange] = useState({ from: '2024-01-01', to: '2024-12-31' });
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [showMultiCurrency, setShowMultiCurrency] = useState(false);

  // Sample data based on Odoo accounting structure
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'MISC/2024/0001',
      date: '2024-01-15',
      description: 'Customer Invoice - INV/2024/0001',
      account: '400000 - Product Sales',
      debit: 0,
      credit: 1250.00,
      balance: 1250.00,
      reference: 'INV/2024/0001',
      type: 'income',
      partner: 'ABC Company Ltd.',
      tags: ['sales', 'customer'],
      analyticsAccount: 'Project Alpha',
      currency: 'USD',
      exchangeRate: 1.0
    },
    {
      id: 'MISC/2024/0002',
      date: '2024-01-15',
      description: 'Office Supplies - BILL/2024/0001',
      account: '620000 - Office Expenses',
      debit: 150.00,
      credit: 0,
      balance: -150.00,
      reference: 'BILL/2024/0001',
      type: 'expense',
      partner: 'Office Supplies Inc.',
      tags: ['office', 'supplies'],
      currency: 'USD',
      exchangeRate: 1.0
    },
    {
      id: 'BNK1/2024/0001',
      date: '2024-01-16',
      description: 'Bank Transfer to Savings',
      account: '100000 - Cash and Cash Equivalents',
      debit: 500.00,
      credit: 0,
      balance: 500.00,
      reference: 'BNK1/2024/0001',
      type: 'transfer',
      currency: 'USD',
      exchangeRate: 1.0
    },
    {
      id: 'SAL/2024/0001',
      date: '2024-01-17',
      description: 'VAT on Sales',
      account: '251000 - Tax Received',
      debit: 0,
      credit: 200.00,
      balance: 200.00,
      reference: 'INV/2024/0001',
      type: 'income',
      partner: 'ABC Company Ltd.',
      tags: ['tax', 'vat'],
      currency: 'USD',
      exchangeRate: 1.0
    }
  ]);

  const [accounts, setAccounts] = useState<Account[]>([
    { 
      id: '100000', 
      code: '100000', 
      name: 'Cash and Cash Equivalents', 
      type: 'asset_current', 
      balance: 15000, 
      isActive: true, 
      reconcile: false,
      company: 'Main Company',
      group: 'Current Assets'
    },
    { 
      id: '120000', 
      code: '120000', 
      name: 'Account Receivable', 
      type: 'asset_receivable', 
      balance: 8500, 
      isActive: true, 
      reconcile: true,
      company: 'Main Company',
      group: 'Current Assets'
    },
    { 
      id: '140000', 
      code: '140000', 
      name: 'Inventory', 
      type: 'asset_current', 
      balance: 25000, 
      isActive: true, 
      reconcile: false,
      company: 'Main Company',
      group: 'Current Assets'
    },
    { 
      id: '150000', 
      code: '150000', 
      name: 'Fixed Assets', 
      type: 'asset_fixed', 
      balance: 50000, 
      isActive: true, 
      reconcile: false,
      company: 'Main Company',
      group: 'Non-Current Assets'
    },
    { 
      id: '200000', 
      code: '200000', 
      name: 'Account Payable', 
      type: 'liability_payable', 
      balance: 5500, 
      isActive: true, 
      reconcile: true,
      company: 'Main Company',
      group: 'Current Liabilities'
    },
    { 
      id: '250000', 
      code: '250000', 
      name: 'Tax Payable', 
      type: 'liability_current', 
      balance: 2500, 
      isActive: true, 
      reconcile: false,
      company: 'Main Company',
      group: 'Current Liabilities'
    },
    { 
      id: '251000', 
      code: '251000', 
      name: 'Tax Received', 
      type: 'liability_current', 
      balance: 1200, 
      isActive: true, 
      reconcile: false,
      company: 'Main Company',
      group: 'Current Liabilities'
    },
    { 
      id: '270000', 
      code: '270000', 
      name: 'Long-term Debt', 
      type: 'liability_non_current', 
      balance: 20000, 
      isActive: true, 
      reconcile: false,
      company: 'Main Company',
      group: 'Non-Current Liabilities'
    },
    { 
      id: '300000', 
      code: '300000', 
      name: 'Owner Equity', 
      type: 'equity', 
      balance: 72000, 
      isActive: true, 
      reconcile: false,
      company: 'Main Company',
      group: 'Equity'
    },
    { 
      id: '999999', 
      code: '999999', 
      name: 'Undistributed Profits/Losses', 
      type: 'equity_unaffected', 
      balance: 8300, 
      isActive: true, 
      reconcile: false,
      company: 'Main Company',
      group: 'Equity'
    },
    { 
      id: '400000', 
      code: '400000', 
      name: 'Product Sales', 
      type: 'income', 
      balance: 45000, 
      isActive: true, 
      reconcile: false,
      company: 'Main Company',
      group: 'Revenue'
    },
    { 
      id: '410000', 
      code: '410000', 
      name: 'Service Sales', 
      type: 'income', 
      balance: 12000, 
      isActive: true, 
      reconcile: false,
      company: 'Main Company',
      group: 'Revenue'
    },
    { 
      id: '500000', 
      code: '500000', 
      name: 'Cost of Revenue', 
      type: 'expense_direct_cost', 
      balance: 18000, 
      isActive: true, 
      reconcile: false,
      company: 'Main Company',
      group: 'Cost of Revenue'
    },
    { 
      id: '620000', 
      code: '620000', 
      name: 'Office Expenses', 
      type: 'expense', 
      balance: 3500, 
      isActive: true, 
      reconcile: false,
      company: 'Main Company',
      group: 'Expenses'
    },
    { 
      id: '630000', 
      code: '630000', 
      name: 'Marketing Expenses', 
      type: 'expense', 
      balance: 2500, 
      isActive: true, 
      reconcile: false,
      company: 'Main Company',
      group: 'Expenses'
    },
    { 
      id: '670000', 
      code: '670000', 
      name: 'Depreciation Expense', 
      type: 'expense_depreciation', 
      balance: 5000, 
      isActive: true, 
      reconcile: false,
      company: 'Main Company',
      group: 'Expenses'
    }
  ]);

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    {
      id: 'MISC/2024/0001',
      date: '2024-01-15',
      reference: 'INV/2024/0001',
      description: 'Customer Invoice - ABC Company Ltd.',
      journal: 'Sales Journal',
      entries: [
        { 
          account: '120000', 
          accountCode: '120000',
          name: 'Account Receivable',
          debit: 1450, 
          credit: 0,
          partner: 'ABC Company Ltd.',
          taxIds: ['tax_sale_15']
        },
        { 
          account: '400000', 
          accountCode: '400000',
          name: 'Product Sales',
          debit: 0, 
          credit: 1250,
          partner: 'ABC Company Ltd.'
        },
        { 
          account: '251000', 
          accountCode: '251000',
          name: 'Tax Received',
          debit: 0, 
          credit: 200,
          partner: 'ABC Company Ltd.'
        }
      ],
      totalDebit: 1450,
      totalCredit: 1450,
      status: 'posted',
      company: 'Main Company',
      currency: 'USD',
      exchangeRate: 1.0,
      postedBy: 'Admin User',
      postedDate: '2024-01-15'
    },
    {
      id: 'BNK1/2024/0001',
      date: '2024-01-16',
      reference: 'BNK1/2024/0001',
      description: 'Bank Statement - January',
      journal: 'Bank Journal',
      entries: [
        { 
          account: '100000', 
          accountCode: '100000',
          name: 'Cash and Cash Equivalents',
          debit: 1450, 
          credit: 0
        },
        { 
          account: '120000', 
          accountCode: '120000',
          name: 'Account Receivable',
          debit: 0, 
          credit: 1450,
          partner: 'ABC Company Ltd.'
        }
      ],
      totalDebit: 1450,
      totalCredit: 1450,
      status: 'posted',
      company: 'Main Company',
      currency: 'USD',
      exchangeRate: 1.0,
      postedBy: 'Admin User',
      postedDate: '2024-01-16'
    }
  ]);

  const [journals] = useState<Journal[]>([
    { id: 'SAL', name: 'Sales Journal', code: 'SAL', type: 'sale', defaultAccount: '400000', sequence: 5, isActive: true, currency: 'USD', company: 'Main Company' },
    { id: 'PUR', name: 'Purchase Journal', code: 'PUR', type: 'purchase', defaultAccount: '200000', sequence: 6, isActive: true, currency: 'USD', company: 'Main Company' },
    { id: 'BNK1', name: 'Bank Journal', code: 'BNK1', type: 'bank', defaultAccount: '100000', sequence: 1, isActive: true, currency: 'USD', company: 'Main Company' },
    { id: 'CSH1', name: 'Cash Journal', code: 'CSH1', type: 'cash', defaultAccount: '100000', sequence: 2, isActive: true, currency: 'USD', company: 'Main Company' },
    { id: 'MISC', name: 'Miscellaneous Operations', code: 'MISC', type: 'general', sequence: 10, isActive: true, currency: 'USD', company: 'Main Company' }
  ]);

  const [taxConfigurations] = useState<TaxConfiguration[]>([
    {
      id: 'tax_sale_15',
      name: '15% VAT (Sales)',
      amount: 15.0,
      amountType: 'percent',
      typeUse: 'sale',
      scope: 'consu',
      active: true,
      sequence: 1,
      description: 'VAT 15% for sales',
      priceInclude: false,
      includeBaseAmount: false,
      isBaseAffected: false,
      analytic: false,
      company: 'Main Company',
      repartitionLines: [
        { factorPercent: 100, repartitionType: 'base', accountId: '400000' },
        { factorPercent: 100, repartitionType: 'tax', accountId: '251000', tagIds: ['tax_tag_output'] }
      ]
    },
    {
      id: 'tax_purchase_15',
      name: '15% VAT (Purchases)',
      amount: 15.0,
      amountType: 'percent',
      typeUse: 'purchase',
      scope: 'consu',
      active: true,
      sequence: 2,
      description: 'VAT 15% for purchases',
      priceInclude: false,
      includeBaseAmount: false,
      isBaseAffected: false,
      analytic: false,
      company: 'Main Company',
      repartitionLines: [
        { factorPercent: 100, repartitionType: 'base', accountId: '500000' },
        { factorPercent: 100, repartitionType: 'tax', accountId: '250000', tagIds: ['tax_tag_input'] }
      ]
    }
  ]);

  const [bankReconciliations] = useState<BankReconciliation[]>([
    {
      id: 'REC/2024/0001',
      date: '2024-01-31',
      statementName: 'January 2024 Bank Statement',
      bankAccount: 'BNK1',
      startingBalance: 10000,
      endingBalance: 15500,
      status: 'open',
      transactions: [
        { id: 'ST001', date: '2024-01-15', ref: 'INV/2024/0001', description: 'Customer Payment', amount: 1450, matched: true, partner: 'ABC Company Ltd.' },
        { id: 'ST002', date: '2024-01-20', ref: 'BILL/2024/0001', description: 'Supplier Payment', amount: -500, matched: false, partner: 'Office Supplies Inc.' },
        { id: 'ST003', date: '2024-01-25', ref: 'INT/2024/0001', description: 'Bank Interest', amount: 50, matched: false }
      ]
    }
  ]);

  const [analyticAccounts] = useState<AnalyticAccount[]>([
    { id: 'PROJ_ALPHA', name: 'Project Alpha', code: 'ALPHA', active: true, company: 'Main Company', partner: 'ABC Company Ltd.', balance: 5000, debit: 8000, credit: 3000 },
    { id: 'PROJ_BETA', name: 'Project Beta', code: 'BETA', active: true, company: 'Main Company', partner: 'XYZ Corp.', balance: -2000, debit: 3000, credit: 5000 },
    { id: 'DEPT_SALES', name: 'Sales Department', code: 'SALES', active: true, company: 'Main Company', balance: 12000, debit: 15000, credit: 3000 },
    { id: 'DEPT_MARKETING', name: 'Marketing Department', code: 'MKT', active: true, company: 'Main Company', balance: -5000, debit: 2000, credit: 7000 }
  ]);

  const [fixedAssets] = useState<FixedAsset[]>([
    {
      id: 'FA001',
      name: 'Office Building',
      code: 'BUILD001',
      category: 'Buildings',
      acquisitionDate: '2020-01-01',
      acquisitionValue: 500000,
      depreciationMethod: 'linear',
      depreciationYears: 25,
      depreciationRate: 4.0,
      currentValue: 420000,
      accumulatedDepreciation: 80000,
      status: 'running',
      company: 'Main Company'
    },
    {
      id: 'FA002',
      name: 'Company Vehicles',
      code: 'VEH001',
      category: 'Vehicles',
      acquisitionDate: '2022-06-01',
      acquisitionValue: 50000,
      depreciationMethod: 'accelerated',
      depreciationYears: 5,
      depreciationRate: 20.0,
      currentValue: 30000,
      accumulatedDepreciation: 20000,
      status: 'running',
      company: 'Main Company'
    }
  ]);

  const [currencies] = useState<MultiCurrency[]>([
    {
      id: 'USD',
      name: 'US Dollar',
      symbol: '$',
      position: 'before',
      rounding: 0.01,
      active: true,
      rates: [
        { date: '2024-01-01', rate: 1.0, inverseRate: 1.0 }
      ]
    },
    {
      id: 'EUR',
      name: 'Euro',
      symbol: '€',
      position: 'before',
      rounding: 0.01,
      active: true,
      rates: [
        { date: '2024-01-01', rate: 0.85, inverseRate: 1.176 }
      ]
    },
    {
      id: 'GBP',
      name: 'British Pound',
      symbol: '£',
      position: 'before',
      rounding: 0.01,
      active: true,
      rates: [
        { date: '2024-01-01', rate: 0.73, inverseRate: 1.37 }
      ]
    }
  ]);

  const [budgets] = useState<Budget[]>([
    {
      id: 'BUDGET_2024',
      name: '2024 Annual Budget',
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31',
      state: 'validate',
      budgetLines: [
        {
          id: 'BL001',
          analyticAccount: 'PROJ_ALPHA',
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31',
          plannedAmount: 50000,
          practicalAmount: 12000,
          theoreticalAmount: 15000,
          percentage: 24.0
        },
        {
          id: 'BL002',
          analyticAccount: 'DEPT_SALES',
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31',
          plannedAmount: 100000,
          practicalAmount: 25000,
          theoreticalAmount: 30000,
          percentage: 25.0
        }
      ]
    }
  ]);

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'asset_receivable':
      case 'asset_payable':
      case 'asset_cash':
      case 'asset_current':
      case 'asset_non_current':
      case 'asset_prepayments':
      case 'asset_fixed':
        return 'bg-green-100 text-green-800';
      case 'liability_payable':
      case 'liability_current':
      case 'liability_non_current':
        return 'bg-red-100 text-red-800';
      case 'equity':
      case 'equity_unaffected':
        return 'bg-blue-100 text-blue-800';
      case 'income':
      case 'income_other':
        return 'bg-purple-100 text-purple-800';
      case 'expense':
      case 'expense_depreciation':
      case 'expense_direct_cost':
        return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'income': return <TrendingUp className="text-green-600" size={16} />;
      case 'expense': return <TrendingDown className="text-red-600" size={16} />;
      case 'transfer': return <CreditCard className="text-blue-600" size={16} />;
      default: return <FileText className="text-gray-600" size={16} />;
    }
  };

  // Calculate financial summary
  const totalAssets = accounts.filter(a => 
    a.type.startsWith('asset')
  ).reduce((sum, a) => sum + a.balance, 0);
  
  const totalLiabilities = accounts.filter(a => 
    a.type.startsWith('liability')
  ).reduce((sum, a) => sum + a.balance, 0);
  
  const totalEquity = accounts.filter(a => 
    a.type.startsWith('equity')
  ).reduce((sum, a) => sum + a.balance, 0);
  
  const totalIncome = accounts.filter(a => 
    a.type.startsWith('income')
  ).reduce((sum, a) => sum + a.balance, 0);
  
  const totalExpenses = accounts.filter(a => 
    a.type.startsWith('expense')
  ).reduce((sum, a) => sum + a.balance, 0);
  
  const netIncome = totalIncome - totalExpenses;

  const formatCurrency = (amount: number, currency = selectedCurrency) => {
    const curr = currencies.find(c => c.id === currency);
    if (curr) {
      const formatted = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return curr.position === 'before' ? `${curr.symbol}${formatted}` : `${formatted}${curr.symbol}`;
    }
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Accounting</h1>
        <div className="flex space-x-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <Download size={20} />
            <span>Export</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus size={20} />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <DollarSign className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">${totalAssets.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <CreditCard className="text-red-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Liabilities</p>
              <p className="text-2xl font-bold text-gray-900">${totalLiabilities.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Banknote className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Equity</p>
              <p className="text-2xl font-bold text-gray-900">${totalEquity.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <TrendingUp className="text-purple-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">${totalIncome.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <TrendingDown className="text-orange-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Net Income</p>
              <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${netIncome.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap space-x-4 md:space-x-8">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: BarChart3, count: 0 },
            { id: 'transactions', name: 'Transactions', icon: Receipt, count: transactions.length },
            { id: 'accounts', name: 'Chart of Accounts', icon: BookOpen, count: accounts.length },
            { id: 'journal', name: 'Journal Entries', icon: FileText, count: journalEntries.length },
            { id: 'reconciliation', name: 'Bank Reconciliation', icon: CreditCard, count: bankReconciliations.length },
            { id: 'reports', name: 'Financial Reports', icon: PieChart, count: 0 },
            { id: 'taxes', name: 'Taxes', icon: Calculator, count: taxConfigurations.length },
            { id: 'analytics', name: 'Analytics', icon: TrendingUp, count: analyticAccounts.length },
            { id: 'settings', name: 'Settings', icon: Settings, count: 0 }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent size={16} />
                <span className="hidden sm:inline">{tab.name}</span>
                {tab.count > 0 && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">{tab.count}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Debit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTransactionTypeIcon(transaction.type)}
                        <span className="ml-2 text-sm text-gray-900">{transaction.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.account}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.reference}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.debit > 0 ? `$${transaction.debit.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.credit > 0 ? `$${transaction.credit.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={transaction.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ${Math.abs(transaction.balance).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Chart of Accounts Tab */}
      {activeTab === 'accounts' && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Chart of Accounts</h2>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                <Plus size={20} />
                <span>Add Account</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccountTypeColor(account.type)}`}>
                        {account.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${account.balance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        account.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {account.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Journal Entries Tab */}
      {activeTab === 'journal' && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Journal Entries</h2>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                <Plus size={20} />
                <span>New Journal Entry</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Debit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Credit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {journalEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.reference}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${entry.totalDebit.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${entry.totalCredit.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        entry.status === 'posted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cash Position</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(accounts.find(a => a.type === 'asset_cash')?.balance || 0)}
                  </p>
                </div>
                <DollarSign className="text-green-600" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Outstanding Receivables</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(accounts.find(a => a.type === 'asset_receivable')?.balance || 0)}
                  </p>
                </div>
                <Users className="text-blue-600" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Outstanding Payables</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(accounts.find(a => a.type === 'liability_payable')?.balance || 0)}
                  </p>
                </div>
                <Building className="text-red-600" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalIncome / 12)}</p>
                </div>
                <TrendingUp className="text-purple-600" size={32} />
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.slice(0, 5).map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(transaction.debit || transaction.credit)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Posted
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Aging Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Accounts Receivable Aging</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">0-30 days</span>
                  <span className="text-sm font-medium">{formatCurrency(5000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">31-60 days</span>
                  <span className="text-sm font-medium">{formatCurrency(2500)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">61-90 days</span>
                  <span className="text-sm font-medium">{formatCurrency(800)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">90+ days</span>
                  <span className="text-sm font-medium text-red-600">{formatCurrency(200)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Accounts Payable Aging</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">0-30 days</span>
                  <span className="text-sm font-medium">{formatCurrency(3000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">31-60 days</span>
                  <span className="text-sm font-medium">{formatCurrency(1500)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">61-90 days</span>
                  <span className="text-sm font-medium">{formatCurrency(700)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">90+ days</span>
                  <span className="text-sm font-medium text-red-600">{formatCurrency(300)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Reconciliation Tab */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-6">
          {bankReconciliations.map((reconciliation) => (
            <div key={reconciliation.id} className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{reconciliation.statementName}</h3>
                    <p className="text-sm text-gray-600">Bank Account: {reconciliation.bankAccount} | Date: {reconciliation.date}</p>
                  </div>
                  <div className="flex space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Starting Balance</p>
                      <p className="text-lg font-semibold">{formatCurrency(reconciliation.startingBalance)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Ending Balance</p>
                      <p className="text-lg font-semibold">{formatCurrency(reconciliation.endingBalance)}</p>
                    </div>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      reconciliation.status === 'closed' ? 'bg-green-100 text-green-800' : 
                      reconciliation.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {reconciliation.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reconciliation.transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.ref}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{transaction.partner || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(Math.abs(transaction.amount))}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.matched ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transaction.matched ? 'Matched' : 'Unmatched'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-800">
                            {transaction.matched ? 'View' : 'Match'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Taxes Tab */}
      {activeTab === 'taxes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Tax Configuration</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <Plus size={20} />
                  <span>Add Tax</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scope</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {taxConfigurations.map((tax) => (
                    <tr key={tax.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tax.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tax.amountType === 'percent' ? `${tax.amount}%` : formatCurrency(tax.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          tax.typeUse === 'sale' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {tax.typeUse}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tax.scope}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          tax.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tax.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Edit size={16} />
                          </button>
                          <button className="text-red-600 hover:text-red-800">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Tax Collected</h4>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(accounts.find(a => a.code === '251000')?.balance || 0)}
              </p>
              <p className="text-sm text-gray-600 mt-2">Current period</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Tax Payable</h4>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(accounts.find(a => a.code === '250000')?.balance || 0)}
              </p>
              <p className="text-sm text-gray-600 mt-2">Current period</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Net Tax Position</h4>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency((accounts.find(a => a.code === '251000')?.balance || 0) - (accounts.find(a => a.code === '250000')?.balance || 0))}
              </p>
              <p className="text-sm text-gray-600 mt-2">Current period</p>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Analytic Accounts</h3>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                  <Plus size={20} />
                  <span>Add Analytic Account</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Debit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analyticAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{account.partner || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(account.debit)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(account.credit)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={account.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(Math.abs(account.balance))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Edit size={16} />
                          </button>
                          <button className="text-green-600 hover:text-green-800">
                            <BarChart3 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Budget Analysis */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Budget Analysis</h3>
            </div>
            <div className="p-6">
              {budgets.map((budget) => (
                <div key={budget.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold text-gray-900">{budget.name}</h4>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      budget.state === 'validate' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {budget.state}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {budget.budgetLines.map((line) => {
                      const analyticAccount = analyticAccounts.find(a => a.id === line.analyticAccount);
                      return (
                        <div key={line.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{analyticAccount?.name}</span>
                            <span className="text-sm text-gray-600">{line.percentage.toFixed(1)}% of budget used</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Planned</p>
                              <p className="font-semibold">{formatCurrency(line.plannedAmount)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Practical</p>
                              <p className="font-semibold">{formatCurrency(line.practicalAmount)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Theoretical</p>
                              <p className="font-semibold">{formatCurrency(line.theoreticalAmount)}</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  line.percentage > 100 ? 'bg-red-500' : 
                                  line.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(line.percentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                  <select 
                    value={selectedCurrency} 
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.id} value={currency.id}>
                        {currency.name} ({currency.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showMultiCurrency}
                      onChange={(e) => setShowMultiCurrency(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable Multi-Currency</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fiscal Year</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Journal Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Journals</h3>
              <div className="space-y-2">
                {journals.map((journal) => (
                  <div key={journal.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{journal.name}</p>
                      <p className="text-sm text-gray-600">{journal.code} - {journal.type}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        journal.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {journal.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800">
                        <Settings size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fixed Assets */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fixed Assets</h3>
              <div className="space-y-3">
                {fixedAssets.map((asset) => (
                  <div key={asset.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-sm text-gray-600">{asset.category} - {asset.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(asset.currentValue)}</p>
                        <p className="text-xs text-gray-600">{asset.depreciationMethod}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(asset.accumulatedDepreciation / asset.acquisitionValue) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Currency Exchange Rates */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Exchange Rates</h3>
              <div className="space-y-2">
                {currencies.filter(c => c.active).map((currency) => (
                  <div key={currency.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{currency.symbol}</span>
                      <span>{currency.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{currency.rates[0]?.rate.toFixed(4)}</p>
                      <p className="text-xs text-gray-600">1 USD = {currency.rates[0]?.inverseRate.toFixed(4)} {currency.id}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Update Exchange Rates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Financial Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance Sheet</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Assets</span>
                  <span className="text-sm font-medium">{formatCurrency(totalAssets)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Liabilities</span>
                  <span className="text-sm font-medium">{formatCurrency(totalLiabilities)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Total Equity</span>
                  <span className="text-sm font-bold">{formatCurrency(totalEquity)}</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Generate Full Report
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Statement</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="text-sm font-medium">{formatCurrency(totalIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Expenses</span>
                  <span className="text-sm font-medium">{formatCurrency(totalExpenses)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Net Income</span>
                  <span className={`text-sm font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netIncome)}
                  </span>
                </div>
              </div>
              <button className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                Generate Full Report
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Operating Activities</span>
                  <span className="text-sm font-medium text-green-600">{formatCurrency(12500)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Investing Activities</span>
                  <span className="text-sm font-medium text-red-600">{formatCurrency(-5000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Financing Activities</span>
                  <span className="text-sm font-medium text-blue-600">{formatCurrency(2000)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Net Cash Flow</span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(9500)}</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                Generate Full Report
              </button>
            </div>
          </div>

          {/* Additional Reports */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'General Ledger', description: 'Detailed account movements' },
                { name: 'Trial Balance', description: 'Account balances summary' },
                { name: 'Aged Receivables', description: 'Customer payment analysis' },
                { name: 'Aged Payables', description: 'Supplier payment analysis' },
                { name: 'Tax Report', description: 'VAT and tax summary' },
                { name: 'Partner Ledger', description: 'Customer/Supplier statements' },
                { name: 'Profit & Loss', description: 'Income statement details' },
                { name: 'Executive Summary', description: 'Management overview' }
              ].map((report) => (
                <div key={report.name} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium text-gray-900">{report.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">
                    Generate →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}