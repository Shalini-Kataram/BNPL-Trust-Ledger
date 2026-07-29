
import React, { useMemo, useState } from 'react';
import BNPLDashboard from './BNPLDashboard';
import { sampleLedgerData } from './data/sampleLedgerData';

const DEFAULT_CONSENT_API_URL = 'https://bnpl-ledger-api-719603056384.us-central1.run.app/consent';

function getConsentApiCandidates() {
    const configuredUrl = (process.env.REACT_APP_CONSENT_API_URL || '').trim();

    return [configuredUrl, DEFAULT_CONSENT_API_URL].filter(Boolean);
}

function asNumber(value, fallback = 0) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : fallback;
}

function asArray(value) {
    return Array.isArray(value) ? value : [];
}

function pickLedgerEnvelope(apiResponse) {
    if (apiResponse && typeof apiResponse === 'object') {
        if (apiResponse.data && typeof apiResponse.data === 'object') {
            return apiResponse.data;
        }

        if (apiResponse.result && typeof apiResponse.result === 'object') {
            return apiResponse.result;
        }
    }

    return apiResponse;
}

function mapTrustLabel(rawLabel, trustScore) {
    if (rawLabel) {
        return String(rawLabel);
    }

    if (trustScore >= 70) {
        return 'Good';
    }

    if (trustScore >= 40) {
        return 'Medium';
    }

    return 'Low';
}

function mapRiskLevel(rawRiskLevel, riskScore, fallbackRiskLevel) {
    if (rawRiskLevel) {
        return String(rawRiskLevel).toUpperCase();
    }

    const score = asNumber(riskScore, NaN);
    if (!Number.isNaN(score)) {
        if (score <= 30) {
            return 'LOW';
        }

        if (score <= 60) {
            return 'MEDIUM';
        }

        if (score <= 80) {
            return 'HIGH';
        }

        return 'CRITICAL';
    }

    return fallbackRiskLevel;
}

function normalizeLedgerData(apiResponse, fallback) {
    const source = pickLedgerEnvelope(apiResponse);
    const affordabilityAssessment = source?.affordabilityAssessment || {};
    const consentEnriched = affordabilityAssessment?.consentEnriched && typeof affordabilityAssessment.consentEnriched === 'object'
        ? affordabilityAssessment.consentEnriched
        : affordabilityAssessment;
    const aggregatedExposure = source?.aggregatedExposure || {};
    const rawRiskScore = asNumber(consentEnriched?.riskScore, NaN);
    const derivedTrustScore = Number.isNaN(rawRiskScore) ? NaN : Math.max(0, Math.min(100, 100 - rawRiskScore));
    const trustScore = asNumber(source?.trustScore, asNumber(derivedTrustScore, asNumber(fallback.trustScore, 0)));
    const hasProvidersKey = Array.isArray(source?.providers);
    const providersSource = asArray(source?.providers);
    const normalizedProviders = hasProvidersKey
        ? providersSource.map((provider, providerIndex) => {
            const fallbackProvider = fallback.providers?.[providerIndex] || {};
            const activePlansSource = asArray(provider?.activePlans);
            const ledgerEventsSource = asArray(provider?.ledgerEvents);

            return {
                provider: provider?.provider || fallbackProvider.provider || `Provider ${providerIndex + 1}`,
                customerHash: provider?.customerHash || source?.customerHash || fallback.customerHash,
                exposure: asNumber(provider?.exposure, asNumber(fallbackProvider.exposure, 0)),
                activePlans: activePlansSource.length
                    ? activePlansSource.map((plan, planIndex) => ({
                        planId: plan?.planId || `PLAN-${providerIndex + 1}-${planIndex + 1}`,
                        product: plan?.product || 'Unknown Product',
                        amount: asNumber(plan?.amount, 0),
                        monthlyPayment: asNumber(plan?.monthlyPayment, 0),
                        status: plan?.status || 'ACTIVE'
                    }))
                    : asArray(fallbackProvider.activePlans),
                monthlyCommitment: asNumber(provider?.monthlyCommitment, asNumber(fallbackProvider.monthlyCommitment, 0)),
                missedInstallments: asNumber(provider?.missedInstallments, asNumber(fallbackProvider.missedInstallments, 0)),
                defaults: asNumber(provider?.defaults, asNumber(fallbackProvider.defaults, 0)),
                partialRepayments: asNumber(provider?.partialRepayments, asNumber(fallbackProvider.partialRepayments, 0)),
                closedPlans: asNumber(provider?.closedPlans, asNumber(fallbackProvider.closedPlans, 0)),
                ledgerEvents: ledgerEventsSource.length
                    ? ledgerEventsSource.map((event) => ({
                        eventType: event?.eventType || 'NEW_PURCHASE',
                        amount: asNumber(event?.amount, 0),
                        merchant: event?.merchant,
                        date: event?.date || 'N/A'
                    }))
                    : asArray(fallbackProvider.ledgerEvents)
            };
        })
        : asArray(fallback.providers);

    return {
        customerHash: source?.customerHash || source?.accountId || fallback.customerHash,
        trustScore,
        trustScoreLabel: mapTrustLabel(source?.trustScoreLabel, trustScore),
        riskLevel: mapRiskLevel(source?.riskLevel, consentEnriched?.riskScore, fallback.riskLevel),
        totalExposure: asNumber(
            source?.totalExposure,
            asNumber(
                consentEnriched?.currentExposure,
                asNumber(aggregatedExposure?.aggregateOutstandingBalance, asNumber(fallback.totalExposure, 0))
            )
        ),
        activePlans: asNumber(source?.activePlans, asNumber(aggregatedExposure?.totalActivePlans, asNumber(fallback.activePlans, 0))),
        monthlyCommitment: asNumber(
            source?.monthlyCommitment,
            asNumber(aggregatedExposure?.totalMonthlyCommitment, asNumber(fallback.monthlyCommitment, 0))
        ),
        missedInstallments: asNumber(
            source?.missedInstallments,
            asNumber(aggregatedExposure?.totalMissedInstallments, asNumber(fallback.missedInstallments, 0))
        ),
        defaults: asNumber(source?.defaults, asNumber(aggregatedExposure?.totalDefaults, asNumber(fallback.defaults, 0))),
        currentExposure: asNumber(
            consentEnriched?.currentExposure,
            asNumber(aggregatedExposure?.aggregateOutstandingBalance, asNumber(fallback.totalExposure, 0))
        ),
        requestedAmount: asNumber(consentEnriched?.requestedAmount, asNumber(source?.totalAmount, 0)),
        futureExposure: asNumber(
            consentEnriched?.futureExposure,
            asNumber(
                consentEnriched?.currentExposure,
                asNumber(aggregatedExposure?.aggregateOutstandingBalance, asNumber(fallback.totalExposure, 0))
            ) + asNumber(consentEnriched?.requestedAmount, asNumber(source?.totalAmount, 0))
        ),
        exposureRatio: asNumber(consentEnriched?.exposureRatio, 0),
        assessmentMode: affordabilityAssessment?.mode || '',
        assessmentDecision: consentEnriched?.decision || '',
        assessmentReason: consentEnriched?.reason || '',
        assessmentMessage: source?.message || '',
        assessmentRiskScore: asNumber(consentEnriched?.riskScore, 0),
        providers: normalizedProviders
    };
}

const products = [
    { id: 1, name: 'MacBook Pro', category: 'Electronics', price: 2000, rating: 4.8 },
    { id: 2, name: 'Health Insurance Cover', category: 'Insurance', price: 780, rating: 4.4 },
    { id: 3, name: 'Dubai Holiday Package', category: 'Travel', price: 1500, rating: 4.7 },
    { id: 4, name: 'Alloy Wheels Set', category: 'Automotive', price: 920, rating: 4.3 },
    { id: 5, name: 'AWS Certification Path', category: 'Education', price: 680, rating: 4.9 },
    { id: 6, name: 'Dental Treatment Plan', category: 'Healthcare', price: 980, rating: 4.5 },
    { id: 7, name: 'Nike Style Bundle', category: 'Fashion & Style', price: 420, rating: 4.2 },
    { id: 8, name: 'Sofa Collection', category: 'Furniture', price: 1120, rating: 4.6 },
    { id: 9, name: 'Washing Machine', category: 'Home Appliances', price: 640, rating: 4.1 }
];

const existingExposure = [
    { lender: 'Klarna', merchant: 'IKEA', status: 'Part paid', outstanding: 340, monthly: 56, updated: '4 min ago' },
    { lender: 'Clearpay', merchant: 'ASOS', status: 'On track', outstanding: 280, monthly: 47, updated: '8 min ago' },
    { lender: 'PayPal Pay Later', merchant: 'easyJet', status: 'On track', outstanding: 190, monthly: 32, updated: '17 min ago' }
];

const networkEvents = [
    { time: '09:12', type: 'Partial repay', detail: 'Klarna posted £40 repayment and refreshed remaining balance.' },
    { time: '09:03', type: 'New purchase', detail: 'A fresh BNPL plan was created with another lender.' },
    { time: '08:55', type: 'Plan closed', detail: 'One external instalment plan was closed and reported.' }
];

const policy = {
    exposureLimit: 3000,
    monthlyLimit: 380,
    cautionExposure: 2300,
    cautionMonthly: 300
};

const emiOptions = [3, 6, 9, 12];

const paymentOptions = [
    { id: 'bnpl', label: 'BNPL (Pay in instalments)', note: 'Split payments with selected EMI term', fee: 0 },
    // { id: 'credit-card', label: 'Credit Card', note: 'Instant autopay setup', fee: 0 },
    // { id: 'digital-wallet', label: 'Digital Wallet', note: 'Fast one-tap repayments', fee: 8 }
];

const flowSteps = [
    '1. Browse products',
    '2. Review cart',
    '3. BNPL account access',
    '4. Payment options and EMI selection',
    '5. Capture consent',
    '6. Review BNPL dashboard',
    '7. Affordability decision'
];

function formatCurrency(value) {
    return `£${value.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;
}

function renderStars(rating) {
    const fullStars = Math.round(rating);
    return Array.from({ length: 5 }, (_, index) => index < fullStars);
}

export default function App() {
    const [authMode, setAuthMode] = useState('login');
    const [loginForm, setLoginForm] = useState({ accountId: '', password: '' });
    const [signupForm, setSignupForm] = useState({ fullName: '', email: '', mobile: '', password: '', confirmPassword: '' });
    const [authError, setAuthError] = useState('');
    const [bnplAccountName, setBnplAccountName] = useState('');
    const [cart, setCart] = useState([]);
    const [step, setStep] = useState(0);
    const [consent, setConsent] = useState(false);
    const [selectedEmiMonths, setSelectedEmiMonths] = useState(3);
    const [hasSelectedEmiMonths, setHasSelectedEmiMonths] = useState(false);
    const [selectedPaymentOption, setSelectedPaymentOption] = useState(paymentOptions[0].id);
    const [dashboardData, setDashboardData] = useState(sampleLedgerData);
    const [isFetchingDashboardData, setIsFetchingDashboardData] = useState(false);
    const [consentApiError, setConsentApiError] = useState('');

    const selectedPayment = paymentOptions.find(option => option.id === selectedPaymentOption) || paymentOptions[0];

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const exposureSummary = useMemo(() => {
        const baseExposure = existingExposure.reduce((sum, item) => sum + item.outstanding, 0);
        const baseMonthly = existingExposure.reduce((sum, item) => sum + item.monthly, 0);
        const proposedMonthly = cartTotal ? Math.round(cartTotal / selectedEmiMonths) : 0;

        return {
            baseExposure,
            baseMonthly,
            proposedMonthly,
            totalExposure: baseExposure + cartTotal,
            totalMonthly: baseMonthly + proposedMonthly
        };
    }, [cartTotal, selectedEmiMonths]);

    const decision = useMemo(() => {
        const apiDecisionLabel = String(dashboardData.assessmentDecision || '').trim().toUpperCase();
        const apiDecisionReason = String(dashboardData.assessmentReason || '').trim();
        const apiMode = String(dashboardData.assessmentMode || '').trim();

        if (apiDecisionLabel) {
            let tone = 'warn';
            if (apiDecisionLabel === 'APPROVED' || apiDecisionLabel === 'APPROVE') {
                tone = 'good';
            } else if (apiDecisionLabel === 'DECLINED' || apiDecisionLabel === 'DECLINE' || apiDecisionLabel === 'REJECTED') {
                tone = 'bad';
            }

            const reasons = [];
            if (apiDecisionReason) {
                reasons.push(apiDecisionReason);
            }

            if (apiMode) {
                reasons.push(`Assessment mode: ${apiMode}`);
            }

            reasons.push(`Risk score: ${dashboardData.assessmentRiskScore}`);

            if (dashboardData.exposureRatio) {
                reasons.push(`Exposure ratio: ${(dashboardData.exposureRatio * 100).toFixed(1)}%`);
            }

            return {
                label: apiDecisionLabel === 'REVIEW' ? 'Manual review' : apiDecisionLabel,
                tone,
                reasons
            };
        }

        if (!consent) {
            return {
                label: 'Manual review',
                tone: 'warn',
                reasons: [
                    'Customer did not grant consent, so decisioning proceeds with limited visibility and must be manually reviewed.',
                    'Cross-lender exposure checks are optional in this flow and should be captured as an audit note.'
                ]
            };
        }

        if (!cartItemCount) {
            return {
                label: 'Pending cart',
                tone: 'warn',
                reasons: ['Add at least one product to run an affordability decision.']
            };
        }

        const reasons = [];
        let label = 'Approved';
        let tone = 'good';

        if (exposureSummary.totalExposure > policy.exposureLimit) {
            label = 'Decline or refer';
            tone = 'bad';
            reasons.push('Total BNPL exposure breaches policy exposure threshold.');
        }

        if (exposureSummary.totalMonthly > policy.monthlyLimit) {
            label = 'Decline or refer';
            tone = 'bad';
            reasons.push('Combined monthly commitments exceed affordability guardrail.');
        }

        if (tone !== 'bad' && exposureSummary.totalExposure > policy.cautionExposure) {
            label = 'Manual review';
            tone = 'warn';
            reasons.push('Exposure is near policy ceiling and requires manual review.');
        }

        if (tone !== 'bad' && exposureSummary.totalMonthly > policy.cautionMonthly) {
            label = 'Manual review';
            tone = 'warn';
            reasons.push('Monthly commitments are approaching affordability limits.');
        }

        if (!reasons.length) {
            reasons.push('Cross-lender exposure and projected monthly repayments are within policy appetite.');
        }

        return { label, tone, reasons };
    }, [cartItemCount, consent, exposureSummary, dashboardData]);

    const updateQuantity = (product, delta) => {
        setCart(current => {
            const existingIndex = current.findIndex(item => item.id === product.id);

            if (existingIndex === -1 && delta > 0) {
                return [...current, { ...product, quantity: delta }];
            }

            if (existingIndex === -1) {
                return current;
            }

            const next = [...current];
            const updatedQuantity = next[existingIndex].quantity + delta;

            if (updatedQuantity <= 0) {
                next.splice(existingIndex, 1);
                return next;
            }

            next[existingIndex] = { ...next[existingIndex], quantity: updatedQuantity };
            return next;
        });
    };

    const getQuantity = productId => cart.find(item => item.id === productId)?.quantity || 0;

    const resetJourney = () => {
        setStep(0);
        setConsent(false);
        setSelectedEmiMonths(12);
        setHasSelectedEmiMonths(false);
        setSelectedPaymentOption(paymentOptions[0].id);
        setDashboardData(sampleLedgerData);
        setIsFetchingDashboardData(false);
        setConsentApiError('');
        setCart([]);
        setAuthError('');
        setBnplAccountName('');
        setLoginForm({ accountId: '', password: '' });
        setSignupForm({ fullName: '', email: '', mobile: '', password: '', confirmPassword: '' });
        setAuthMode('login');
    };

    const handleAuthSubmit = event => {
        event.preventDefault();
        setAuthError('');

        if (authMode === 'login') {
            if (!loginForm.accountId.trim() || !loginForm.password.trim()) {
                setAuthError('Please enter BNPL account ID and password to continue.');
                return;
            }

            setBnplAccountName(loginForm.accountId.trim());
            return;
        }

        if (!signupForm.fullName.trim() || !signupForm.email.trim() || !signupForm.mobile.trim() || !signupForm.password.trim()) {
            setAuthError('Please fill all required fields to create a new BNPL account.');
            return;
        }

        if (signupForm.password !== signupForm.confirmPassword) {
            setAuthError('Password and confirm password must match.');
            return;
        }

        setBnplAccountName(signupForm.fullName.trim());
    };

    const handleConsentToggle = event => {
        const isChecked = event.target.checked;
        setConsent(isChecked);
    };

    const handleDashboardConfirm = () => {
        setConsent(true);
        setStep(6);
    };

    const handleDashboardCancel = () => {
        setConsent(false);
        setStep(1);
    };

    const handleDashboardBackToHome = () => {
        setStep(0);
    };

    const fetchConsentDashboardData = async () => {
        setIsFetchingDashboardData(true);
        setConsentApiError('');

        const payload = {
            consent,
            accountId: bnplAccountName || loginForm.accountId.trim(),
            emiOpted: selectedEmiMonths,
            productDetails: cart.map(item => ({
                id: item.id,
                name: item.name,
                category: item.category,
                quantity: item.quantity,
                unitPrice: item.price,
                totalPrice: item.price * item.quantity
            })),
            totalAmount: cartTotal,
            paymentOption: selectedPaymentOption
        };

        const candidates = getConsentApiCandidates();
        let lastError = null;

        try {
            for (const endpoint of candidates) {
                try {
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        throw new Error(`Consent API returned ${response.status} for ${endpoint}`);
                    }

                    const responseData = await response.json();
                    const normalized = normalizeLedgerData(responseData, sampleLedgerData);
                    setDashboardData(normalized);
                    return;
                } catch (error) {
                    lastError = error;
                }
            }

            throw lastError || new Error('Consent API call failed');
        } catch (error) {
            setDashboardData(sampleLedgerData);
            const message = String(error?.message || '');
            const dnsFailure = message.includes('ERR_NAME_NOT_RESOLVED') || message.includes('name could not be resolved');
            setConsentApiError(
                dnsFailure
                    ? 'Consent API host could not be resolved on this network. Showing fallback data.'
                    : 'Unable to fetch live BNPL dashboard data. Showing fallback data.'
            );
        } finally {
            setIsFetchingDashboardData(false);
        }
    };

    const handleNext = async () => {
        if (step === 4) {
            await fetchConsentDashboardData();
        }

        setStep(current => Math.min(flowSteps.length - 1, current + 1));
    };

    const trustScoreLabel = String(dashboardData.trustScoreLabel || '').trim().toUpperCase();
    const apiDecisionLabel = String(dashboardData.assessmentDecision || '').trim().toUpperCase();
    const rejectedDecisionSet = ['REJECT', 'REJECTED', 'DECLINE', 'DECLINED'];
    const isRejectedDecision = rejectedDecisionSet.includes(apiDecisionLabel);
    const apiRiskScore = Number(dashboardData.assessmentRiskScore);
    const canProceedFromDashboard =
        !isRejectedDecision
        && (
            trustScoreLabel === 'GOOD'
            || trustScoreLabel === 'MEDIUM'
            || ['REVIEW', 'APPROVE', 'APPROVED'].includes(apiDecisionLabel)
        );
    const displayDecisionLabel = String(decision.label || '').trim().toUpperCase();
    const shouldShowCustomerGuidance =
        (!Number.isNaN(apiRiskScore) && apiRiskScore > 70)
        || (apiDecisionLabel
            ? apiDecisionLabel !== 'APPROVE' && apiDecisionLabel !== 'APPROVED'
            : displayDecisionLabel !== 'APPROVE' && displayDecisionLabel !== 'APPROVED' && displayDecisionLabel !== 'APPROVED WITH CONDITIONS');
    const rejectionGuidance = useMemo(() => {
        const reason = String(dashboardData.assessmentReason || '').trim();
        const apiMessage = String(dashboardData.assessmentMessage || '').trim();
        const mode = String(dashboardData.assessmentMode || '').trim();
        const riskScore = Number(dashboardData.assessmentRiskScore);
        const exposureRatio = Number(dashboardData.exposureRatio);
        const reasonUpper = reason.toUpperCase();

        let title = 'We know this is disappointing, and we are here to help.';
        let message = 'Your BNPL request is not approved right now based on the current affordability checks.';
        let actions = [
            'Try reducing the purchase amount',
            'Select a different repayment option',
            'Retry later after updating account balances'
        ];

        if (reasonUpper.includes('AFFORDABILITY')) {
            title = 'Your current affordability check needs improvement before approval.';
            message = 'This decision helps avoid repayment pressure and protect your financial wellbeing.';
            actions = [
                'Reduce your basket value and try again',
                'Choose a longer EMI plan to lower monthly outgoings',
                'Re-apply after your next salary credit'
            ];
        } else if (reasonUpper.includes('EXPOSURE') || (!Number.isNaN(exposureRatio) && exposureRatio > 0.6)) {
            title = 'Your existing credit exposure is currently high for this request.';
            message = 'A lower overall outstanding balance can improve approval chances on the next attempt.';
            actions = [
                'Repay one or more active BNPL plans first',
                'Try a lower ticket amount',
                'Retry after outstanding balances reduce'
            ];
        } else if (!Number.isNaN(riskScore) && riskScore >= 70) {
            title = 'Your current risk profile is above this lender threshold.';
            message = 'A few positive repayment cycles can quickly improve your eligibility.';
            actions = [
                'Make upcoming repayments on time',
                'Avoid taking additional short-term debt for now',
                'Retry after your profile refreshes'
            ];
        }

        if (mode === 'LLOYDS_INTERNAL_ONLY') {
            message += ' This decision is based on internal banking signals only.';
        }

        if (apiMessage) {
            message += ` ${apiMessage}`;
        }

        return { title, message, actions };
    }, [dashboardData.assessmentMessage, dashboardData.assessmentMode, dashboardData.assessmentReason, dashboardData.assessmentRiskScore, dashboardData.exposureRatio]);

    const rejectionDetails = useMemo(() => {
        if (!shouldShowCustomerGuidance) {
            return [];
        }

        const details = [];
        const reason = String(dashboardData.assessmentReason || '').trim();
        const mode = String(dashboardData.assessmentMode || '').trim();
        const riskScore = Number(dashboardData.assessmentRiskScore);
        const exposureRatio = Number(dashboardData.exposureRatio);

        if (reason) {
            details.push(`Decision reason: ${reason}`);
        }

        if (mode) {
            details.push(`Assessment source: ${mode.replaceAll('_', ' ')}`);
        }

        if (!Number.isNaN(riskScore) && riskScore > 0) {
            details.push(`Risk score: ${riskScore}/100 (higher score means higher repayment risk)`);
        }

        if (!Number.isNaN(exposureRatio) && exposureRatio > 0) {
            details.push(`Exposure ratio: ${(exposureRatio * 100).toFixed(1)}% of allowed affordability capacity`);
        }

        if (typeof dashboardData.currentExposure === 'number') {
            details.push(`Current outstanding BNPL exposure: ${formatCurrency(dashboardData.currentExposure)}`);
        }

        if (typeof dashboardData.requestedAmount === 'number') {
            details.push(`Requested BNPL amount: ${formatCurrency(dashboardData.requestedAmount)}`);
        }

        if (typeof dashboardData.futureExposure === 'number') {
            details.push(`Projected exposure after approval: ${formatCurrency(dashboardData.futureExposure)}`);
        }

        return details;
    }, [
        dashboardData.assessmentMode,
        dashboardData.assessmentReason,
        dashboardData.assessmentRiskScore,
        dashboardData.currentExposure,
        dashboardData.exposureRatio,
        dashboardData.futureExposure,
        dashboardData.requestedAmount,
        shouldShowCustomerGuidance
    ]);

    const canMoveNext = [true, cartItemCount > 0, !!bnplAccountName, cartItemCount > 0, true, canProceedFromDashboard, true][step];
    const hasExposureConsent = step >= 5 && (consent || !!dashboardData.assessmentMode);

    return (
        <div className="app-shell">
            <div className="page-glow page-glow-left" />
            <div className="page-glow page-glow-right" />

            <main className="container">
                <section className="hero-panel compact-hero">
                    <div className="hero-main">
                        <p className="eyebrow">BNPL Trust Ledger</p>
                        <h1>Safer BNPL Decisions With Real-Time Cross-Lender Visibility.</h1>
                        <p className="hero-text">
                            Customer-friendly shopping flow with consent-aware affordability checks and explainable outcomes.
                        </p>
                        <div className="quick-actions">
                            <button className="secondary-btn" onClick={() => setStep(1)}>
                                Cart ({cartItemCount})
                            </button>
                            <button className="primary-btn" disabled={!cartItemCount} onClick={() => setStep(2)}>
                                Checkout products
                            </button>
                        </div>
                    </div>

                    <div className="hero-metrics">
                        <div className="metric-chip">
                            <span>BNPL account</span>
                            <strong>{bnplAccountName || 'Active session'}</strong>
                        </div>
                        <div className="metric-chip">
                            <span>Current step</span>
                            <strong>{flowSteps[step]}</strong>
                        </div>
                        <div className="metric-chip">
                            <span>Cart total</span>
                            <strong>{formatCurrency(cartTotal)}</strong>
                        </div>
                        <div className="metric-chip">
                            <span>External BNPL</span>
                            <strong>{hasExposureConsent ? formatCurrency(exposureSummary.baseExposure) : 'Awaiting consent'}</strong>
                        </div>
                        <div className="metric-chip">
                            <span>Selected EMI</span>
                            <strong>{hasSelectedEmiMonths ? `${selectedEmiMonths} months` : 'Not selected'}</strong>
                        </div>
                        <div className="metric-chip">
                            <span>Payment method</span>
                            <strong>{selectedPayment.label}</strong>
                        </div>
                    </div>
                </section>

                <section className="stepper">
                    {flowSteps.map((label, index) => (
                        <div
                            key={label}
                            className={`step-pill ${index === step ? 'is-active' : ''} ${index < step ? 'is-done' : ''}`}
                        >
                            {label}
                        </div>
                    ))}
                </section>

                {step === 0 && (
                    <section className="panel">
                        <div className="section-heading">
                            <div>
                                <p className="eyebrow">Catalogue</p>
                                <h2>Choose products from BNPL categories</h2>
                            </div>
                        </div>

                        <div className="grid">
                            {products.map(product => (
                                <article key={product.id} className="card">
                                    <span className="card-tag">{product.category}</span>
                                    <h3>{product.name}</h3>
                                    <div className="rating-row" aria-label={`Rated ${product.rating} out of 5`}>
                                        {renderStars(product.rating).map((filled, index) => (
                                            <span key={index} className={`star ${filled ? 'is-filled' : ''}`}>
                                                ★
                                            </span>
                                        ))}
                                        <span className="rating-value">{product.rating.toFixed(1)}</span>
                                    </div>
                                    <p className="price">{formatCurrency(product.price)}</p>
                                    <div className="qty-row">
                                        <button className="qty-btn" onClick={() => updateQuantity(product, -1)} disabled={!getQuantity(product.id)}>
                                            -
                                        </button>
                                        <span className="qty-value">{getQuantity(product.id)}</span>
                                        <button className="qty-btn" onClick={() => updateQuantity(product, 1)}>
                                            +
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {step === 1 && (
                    <section className="panel split">
                        <div>
                            <p className="eyebrow">Cart</p>
                            <h2>Review products and continue with BNPL</h2>
                            {cartItemCount ? (
                                <div className="list">
                                    {cart.map(item => (
                                        <div key={item.id} className="list-item">
                                            <div>
                                                <strong>{item.name}</strong>
                                                <span>{item.category} x {item.quantity}</span>
                                            </div>
                                            <div className="item-actions">
                                                <strong>{formatCurrency(item.price * item.quantity)}</strong>
                                                <div className="mini-qty-row">
                                                    <button className="qty-btn mini" onClick={() => updateQuantity(item, -1)}>-</button>
                                                    <span className="qty-value mini">{item.quantity}</span>
                                                    <button className="qty-btn mini" onClick={() => updateQuantity(item, 1)}>+</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>Your cart is empty. Add products in step 1.</p>
                            )}
                        </div>

                        <aside className="side-card">
                            <h3>Order summary</h3>
                            <p>Total purchase value</p>
                            <strong className="big-number">{formatCurrency(cartTotal)}</strong>
                            <button className="secondary-btn" disabled={!cartItemCount} onClick={() => setStep(2)}>
                                Continue to BNPL account access
                            </button>
                        </aside>
                    </section>
                )}

                {step === 2 && (
                    <section className="panel split">
                        <div>
                            <p className="eyebrow">BNPL Account Access</p>
                            <h2>Login or create a BNPL account</h2>
                            <p>
                                Enter existing BNPL account details to continue, or create a new BNPL account for this checkout.
                            </p>

                            <div className="quick-actions">
                                <button
                                    className={`secondary-btn ${authMode === 'login' ? 'is-active-auth' : ''}`}
                                    onClick={() => {
                                        setAuthMode('login');
                                        setAuthError('');
                                    }}
                                >
                                    Login
                                </button>
                                <button
                                    className={`secondary-btn ${authMode === 'signup' ? 'is-active-auth' : ''}`}
                                    onClick={() => {
                                        setAuthMode('signup');
                                        setAuthError('');
                                    }}
                                >
                                    Create New BNPL Account
                                </button>
                            </div>

                            <form className="auth-card" onSubmit={handleAuthSubmit}>
                                <h3>{authMode === 'login' ? 'Existing BNPL Login' : 'New BNPL Account Registration'}</h3>

                                {authMode === 'login' ? (
                                    <>
                                        <label className="auth-field">
                                            <span>BNPL Account ID</span>
                                            <input
                                                type="text"
                                                value={loginForm.accountId}
                                                onChange={event => setLoginForm(current => ({ ...current, accountId: event.target.value }))}
                                                placeholder="Enter account ID"
                                            />
                                        </label>
                                        <label className="auth-field">
                                            <span>Password</span>
                                            <input
                                                type="password"
                                                value={loginForm.password}
                                                onChange={event => setLoginForm(current => ({ ...current, password: event.target.value }))}
                                                placeholder="Enter password"
                                            />
                                        </label>
                                    </>
                                ) : (
                                    <>
                                        <label className="auth-field">
                                            <span>Full Name</span>
                                            <input
                                                type="text"
                                                value={signupForm.fullName}
                                                onChange={event => setSignupForm(current => ({ ...current, fullName: event.target.value }))}
                                                placeholder="Enter full name"
                                            />
                                        </label>
                                        <label className="auth-field">
                                            <span>Email</span>
                                            <input
                                                type="email"
                                                value={signupForm.email}
                                                onChange={event => setSignupForm(current => ({ ...current, email: event.target.value }))}
                                                placeholder="Enter email"
                                            />
                                        </label>
                                        <label className="auth-field">
                                            <span>Mobile Number</span>
                                            <input
                                                type="tel"
                                                value={signupForm.mobile}
                                                onChange={event => setSignupForm(current => ({ ...current, mobile: event.target.value }))}
                                                placeholder="Enter mobile number"
                                            />
                                        </label>
                                        <label className="auth-field">
                                            <span>Password</span>
                                            <input
                                                type="password"
                                                value={signupForm.password}
                                                onChange={event => setSignupForm(current => ({ ...current, password: event.target.value }))}
                                                placeholder="Create password"
                                            />
                                        </label>
                                        <label className="auth-field">
                                            <span>Confirm Password</span>
                                            <input
                                                type="password"
                                                value={signupForm.confirmPassword}
                                                onChange={event => setSignupForm(current => ({ ...current, confirmPassword: event.target.value }))}
                                                placeholder="Confirm password"
                                            />
                                        </label>
                                    </>
                                )}

                                {authError && <p className="auth-error">{authError}</p>}

                                {bnplAccountName && !authError && (
                                    <p className="auth-success">Active BNPL account: {bnplAccountName}</p>
                                )}

                                <button className="primary-btn" type="submit">
                                    {authMode === 'login' ? 'Login to BNPL Account' : 'Create BNPL Account'}
                                </button>
                            </form>
                        </div>

                        <aside className="side-card">
                            <h3>Account validation</h3>
                            <p>
                                Complete this step to continue to payment and EMI setup.
                            </p>
                            <strong>{bnplAccountName ? `Verified: ${bnplAccountName}` : 'No account verified yet'}</strong>
                        </aside>
                    </section>
                )}

                {step === 3 && (
                    <section className="panel split">
                        <div>
                            <p className="eyebrow">EMI Selection</p>
                            <h2>Select repayment months before consent</h2>
                            <p>Choose a repayment tenure to preview monthly instalments for this basket.</p>

                            <div className="emi-grid">
                                {emiOptions.map(months => (
                                    <button
                                        key={months}
                                        className={`emi-option ${hasSelectedEmiMonths && selectedEmiMonths === months ? 'is-active' : ''}`}
                                        onClick={() => {
                                            setSelectedEmiMonths(months);
                                            setHasSelectedEmiMonths(true);
                                        }}
                                    >
                                        <strong>{months} months</strong>
                                        <span>{formatCurrency(cartTotal ? Math.round(cartTotal / months) : 0)} / month</span>
                                    </button>
                                ))}
                            </div>

                            <h3 className="subhead">Choose payment option</h3>
                            <div className="payment-grid">
                                {paymentOptions.map(option => (
                                    <button
                                        key={option.id}
                                        className={`payment-option ${selectedPaymentOption === option.id ? 'is-active' : ''}`}
                                        onClick={() => setSelectedPaymentOption(option.id)}
                                    >
                                        <strong>{option.label}</strong>
                                        <span>{option.note}</span>
                                        <span>{option.fee ? `${formatCurrency(option.fee)} setup fee` : 'No setup fee'}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <aside className="side-card">
                            <h3>Repayment preview</h3>
                            <p>Basket total</p>
                            <strong className="big-number">{formatCurrency(cartTotal)}</strong>
                            <p>Selected term: {selectedEmiMonths} months</p>
                            <p>Estimated monthly: {formatCurrency(exposureSummary.proposedMonthly)}</p>
                            <p>Payment option: {selectedPayment.label}</p>
                            <p>Setup fee: {selectedPayment.fee ? formatCurrency(selectedPayment.fee) : 'No fee'}</p>
                            <button className="secondary-btn" disabled={!cartItemCount} onClick={() => setStep(4)}>
                                Continue to consent
                            </button>
                        </aside>
                    </section>
                )}

                {step === 4 && (
                    <section className="panel split">
                        <div>
                            <p className="eyebrow">Consent</p>
                            <h2>Permissioned data sharing (optional)</h2>
                            <p>
                                Lloyds requests customer permission to query participating BNPL lenders for live
                                outstanding exposure and recent repayment status updates. If not granted, the
                                application can continue but should be routed to manual review.
                            </p>

                            <label className="consent-toggle">
                                <input type="checkbox" checked={consent} onChange={handleConsentToggle} />
                                <span>I consent to cross-lender BNPL exposure check for this application.</span>
                            </label>
                        </div>

                        <aside className="side-card">
                            <h3>Why this matters</h3>
                            <ul>
                                <li>Prevents hidden debt-driven over-lending</li>
                                <li>Improves customer affordability protection</li>
                                <li>Creates an audit trail for Consumer Duty</li>
                            </ul>
                        </aside>
                    </section>
                )}

                {step === 5 && (
                    <section className="panel">
                        <BNPLDashboard
                            ledgerData={dashboardData}
                            isLoading={isFetchingDashboardData}
                            apiError={consentApiError}
                            shouldShowCustomerGuidance={shouldShowCustomerGuidance}
                            rejectionGuidance={rejectionGuidance}
                            rejectionDetails={rejectionDetails}
                            onBackToHome={handleDashboardBackToHome}
                        />
                    </section>
                )}

                {step === 6 && (
                    <section className="panel split">
                        <div>
                            <p className="eyebrow">Decision</p>
                            <h2>Affordability outcome</h2>
                            {shouldShowCustomerGuidance && (
                                <div className="customer-rejection-note" role="status" aria-live="polite">
                                    <p className="customer-rejection-title">{rejectionGuidance.title}</p>
                                    <p>{rejectionGuidance.message}</p>
                                    {rejectionDetails.length > 0 && (
                                        <>
                                            <p className="customer-rejection-detail-title">Why this result was returned:</p>
                                            <ul className="customer-rejection-detail-list">
                                                {rejectionDetails.map(detail => (
                                                    <li key={detail}>{detail}</li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                    <ul>
                                        {rejectionGuidance.actions.map(action => (
                                            <li key={action}>{action}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="decision-metrics">
                                <div>
                                    <span>External exposure</span>
                                    <strong>{hasExposureConsent ? formatCurrency(dashboardData.currentExposure ?? exposureSummary.baseExposure) : 'Limited view'}</strong>
                                </div>
                                <div>
                                    <span>New BNPL request</span>
                                    <strong>{formatCurrency(dashboardData.requestedAmount || cartTotal)}</strong>
                                </div>
                                <div>
                                    <span>Total exposure</span>
                                    <strong>{formatCurrency(dashboardData.futureExposure ?? exposureSummary.totalExposure)}</strong>
                                </div>
                                <div>
                                    <span>Total monthly</span>
                                    <strong>{formatCurrency(dashboardData.monthlyCommitment ?? exposureSummary.totalMonthly)}</strong>
                                </div>
                                <div>
                                    <span>EMI term</span>
                                    <strong>{selectedEmiMonths} months</strong>
                                </div>
                                <div>
                                    <span>Payment method</span>
                                    <strong>{selectedPayment.label}</strong>
                                </div>
                            </div>

                            <div className="list">
                                {decision.reasons.map(reason => (
                                    <div key={reason} className="list-item rationale-item">
                                        {reason}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <aside className="side-card">
                            <h3>Decision auditability</h3>
                            <p>
                                This output links customer consent, ledger evidence, and policy thresholds into one
                                explainable lending decision.
                            </p>
                            <button className="secondary-btn" onClick={resetJourney}>
                                Start new customer journey
                            </button>
                        </aside>
                    </section>
                )}

                <section className="nav-row">
                    <button className="secondary-btn" disabled={step === 0} onClick={() => setStep(current => Math.max(0, current - 1))}>
                        Back
                    </button>
                    <button
                        className="primary-btn"
                        disabled={step >= flowSteps.length - 1 || !canMoveNext || (step === 4 && isFetchingDashboardData)}
                        onClick={handleNext}
                    >
                        Next
                    </button>
                </section>
            </main>
        </div>
    );
}
