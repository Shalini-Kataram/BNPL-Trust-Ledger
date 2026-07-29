import React from "react";
import { sampleLedgerData } from "./data/sampleLedgerData.js";
import "./BNPLDashboard.css";

const BNPLDashboard = ({
    ledgerData,
    isLoading,
    apiError,
    shouldShowCustomerGuidance,
    rejectionGuidance,
    rejectionDetails,
    onBackToHome
}) => {
    const dashboardView = ledgerData || sampleLedgerData;
    const providers = Array.isArray(dashboardView.providers) ? dashboardView.providers : [];

    const hasValue = (value) => value !== null && value !== undefined && value !== "";
    const hasNumber = (value) => typeof value === "number" && Number.isFinite(value);
    const formatMoney = (value) => `£${Number(value).toLocaleString("en-GB")}`;

    const riskLevelMap = {
        LOW: { percentage: 25 },
        MEDIUM: { percentage: 50 },
        HIGH: { percentage: 75 },
        CRITICAL: { percentage: 100 }
    };
    const riskData = riskLevelMap[dashboardView.riskLevel] || riskLevelMap.LOW;
    const hasRiskData = hasValue(dashboardView.riskLevel);
    const riskHue = Math.round((1 - riskData.percentage / 100) * 120);
    const riskColor = `hsl(${riskHue}, 72%, 48%)`;

    const summaryMetrics = [
        {
            label: "Total Exposure",
            value: hasNumber(dashboardView.totalExposure) ? formatMoney(dashboardView.totalExposure) : null,
            trend: hasNumber(dashboardView.activePlans) ? `${dashboardView.activePlans} active plans` : null,
            tone: "warn"
        },
        {
            label: "Monthly Commitment",
            value: hasNumber(dashboardView.monthlyCommitment) ? formatMoney(dashboardView.monthlyCommitment) : null,
            trend: "Across all providers",
            tone: "neutral"
        },
        {
            label: "Missed Installments",
            value: hasNumber(dashboardView.missedInstallments) ? `${dashboardView.missedInstallments}` : null,
            trend: "Payment history",
            tone: dashboardView.missedInstallments > 0 ? "risk" : "good"
        },
        {
            label: "Active Plans",
            value: hasNumber(dashboardView.activePlans) ? `${dashboardView.activePlans}` : null,
            trend: "BNPL providers",
            tone: "neutral"
        }
    ].filter((metric) => hasValue(metric.value));

    const loans = providers.flatMap((provider) =>
        (Array.isArray(provider.activePlans) ? provider.activePlans : []).map((plan) => ({
            loanId: plan.planId,
            loanType: provider.provider,
            bankName: provider.provider,
            principalAmount: plan.amount,
            outstandingAmount: plan.amount,
            emiAmount: plan.monthlyPayment,
            paymentStatus: "ACTIVE",
            nextDueDate: "N/A",
            tenureRemainingMonths: 0,
            product: plan.product
        }))
    );

    const toneClassMap = {
        good: "tone-good",
        warn: "tone-warn",
        risk: "tone-risk",
        neutral: "tone-neutral"
    };

    const statusBadgeMap = {
        ACTIVE: "badge-info",
        Paid: "badge-success",
        Overdue: "badge-danger",
        Upcoming: "badge-warning"
    };

    const hasTrustScore = hasNumber(dashboardView.trustScore);
    const trustScorePercent =
        dashboardView.trustScore <= 100
            ? Math.min(Math.max(dashboardView.trustScore, 0), 100)
            : Math.min(Math.max((dashboardView.trustScore / 900) * 100, 0), 100);
    const trustHue = Math.round((trustScorePercent / 100) * 120);
    const trustScoreColor = `hsl(${trustHue}, 70%, 48%)`;

    const assessmentDecision = String(dashboardView.assessmentDecision || "").trim().toUpperCase();
    const assessmentMode = String(dashboardView.assessmentMode || "").trim();
    const assessmentReason = String(dashboardView.assessmentReason || "").trim();
    const assessmentMessage = String(dashboardView.assessmentMessage || "").trim();
    const assessmentRiskScore = hasNumber(dashboardView.assessmentRiskScore) ? dashboardView.assessmentRiskScore : null;
    const assessmentExposureRatio = hasNumber(dashboardView.exposureRatio) ? dashboardView.exposureRatio : null;
    const hasAssessmentData =
        hasValue(assessmentDecision)
        || hasValue(assessmentMode)
        || hasValue(assessmentReason)
        || hasValue(assessmentMessage)
        || assessmentRiskScore !== null
        || assessmentExposureRatio !== null;

    const approvedDecisionSet = ["APPROVE", "APPROVED", "PASS", "ACCEPTED"];
    const rejectedDecisionSet = ["REJECT", "REJECTED", "DECLINE", "DECLINED"];

    const isAssessmentApproved = approvedDecisionSet.includes(assessmentDecision);
    const isAssessmentRejected = rejectedDecisionSet.includes(assessmentDecision);

    const assessmentStatus = isAssessmentApproved
        ? { icon: "✔", label: "APPROVED", className: "decision-pill approved" }
        : isAssessmentRejected
            ? { icon: "✖", label: "REJECTED", className: "decision-pill rejected" }
            : null;

    return (
        <main className="dashboard-shell">
            {/* Header */}
            <header className="card header-card">
                <div>
                    <p className="eyebrow">BNPL Payment Risk Dashboard</p>
                    <h1>Credit Risk & BNPL Ledger</h1>
                    <p className="subtitle">Real-time financial health and BNPL exposure management</p>
                </div>

                <div className="header-meta-grid">
                    {hasValue(dashboardView.customerHash) && (
                        <div>
                            <p className="meta-label">Customer</p>
                            <p className="meta-value">{dashboardView.customerHash}</p>
                        </div>
                    )}
                    {hasNumber(dashboardView.totalExposure) && (
                        <div>
                            <p className="meta-label">Total Exposure</p>
                            <p className="meta-value">{formatMoney(dashboardView.totalExposure)}</p>
                        </div>
                    )}
                    {hasNumber(dashboardView.activePlans) && (
                        <div>
                            <p className="meta-label">Active Plans</p>
                            <p className="meta-value">{dashboardView.activePlans}</p>
                        </div>
                    )}
                    {hasRiskData && (
                        <div>
                            <p className="meta-label">Risk Level</p>
                            <div
                                className="mini-speedometer"
                                style={{
                                    "--gauge-color": riskColor,
                                    "--gauge-fill": `${riskData.percentage}%`,
                                    "--needle-angle": `${-90 + (riskData.percentage / 100) * 180}deg`
                                }}
                                aria-label={`Risk ${dashboardView.riskLevel} at ${riskData.percentage}%`}
                            >
                                <div className="mini-speedometer-track" />
                                <div className="mini-speedometer-fill" />
                                <div className="mini-speedometer-needle" />
                                <div className="mini-speedometer-center" />
                            </div>
                            <p className="meta-value" style={{ color: riskColor }}>
                                {dashboardView.riskLevel} ({riskData.percentage}%)
                            </p>
                        </div>
                    )}
                </div>

                <div className="badge-row">
                    <span className={`badge badge-info`}>Multi-Provider BNPL</span>
                    {isLoading ? (
                        <span className={`badge badge-warning`}>Loading live data...</span>
                    ) : apiError ? (
                        <span className={`badge badge-danger`}>Fallback data in use</span>
                    ) : (
                        <span className={`badge badge-success`}>Live data loaded</span>
                    )}
                </div>
                {apiError && <p className="subtle-text">{apiError}</p>}
            </header>

            {/* Summary Section */}
            {summaryMetrics.length > 0 && (
                <section>
                    <div className="section-header">
                        <h2>Summary Overview</h2>
                    </div>
                    <div className="summary-grid">
                        {summaryMetrics.map((metric) => (
                            <article className={`card summary-card ${toneClassMap[metric.tone]}`} key={metric.label}>
                                <p className="eyebrow">{metric.label}</p>
                                <h3>{metric.value}</h3>
                                {metric.trend && <p className="subtle-text">{metric.trend}</p>}
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {hasAssessmentData && (
                <section className="card">
                    <div className="section-header">
                        <h2>Affordability Assessment</h2>
                    </div>

                    {assessmentStatus && (
                        <div className={assessmentStatus.className} role="status" aria-live="polite">
                            <span className="decision-pill-icon" aria-hidden="true">{assessmentStatus.icon}</span>
                            <span className="decision-pill-text">{assessmentStatus.label}</span>
                        </div>
                    )}

                    {shouldShowCustomerGuidance && rejectionGuidance && (
                        <div className="customer-rejection-note" role="status" aria-live="polite">
                            <p className="customer-rejection-title">{rejectionGuidance.title}</p>
                            <p>{rejectionGuidance.message}</p>
                            {Array.isArray(rejectionDetails) && rejectionDetails.length > 0 && (
                                <>
                                    <p className="customer-rejection-detail-title">Why this result was returned:</p>
                                    <ul className="customer-rejection-detail-list">
                                        {rejectionDetails.map((detail) => (
                                            <li key={detail}>{detail}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            <ul>
                                {Array.isArray(rejectionGuidance.actions) && rejectionGuidance.actions.map((action) => (
                                    <li key={action}>{action}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
            )}

            {/* Trust Score & Risk Meters */}
            {(hasTrustScore || hasRiskData) && <div className="split-grid">
                {/* Trust Score Meter */}
                {hasTrustScore && (
                    <section className="card score-meter-card">
                        <div className="section-header compact">
                            <h2>Trust Score</h2>
                        </div>

                        <div
                            className="score-ring-wrap"
                            style={{
                                ["--score-percent"]: `${trustScorePercent}%`,
                                ["--score-color"]: trustScoreColor
                            }}
                        >
                            <div className="score-ring-inner">
                                <p className="eyebrow">Score</p>
                                <h3>{dashboardView.trustScore}</h3>
                                {hasValue(dashboardView.trustScoreLabel) && <p className="score-label">{dashboardView.trustScoreLabel}</p>}
                            </div>
                        </div>

                        <p className="subtle-text">Multi-provider trust assessment based on payment history and ledger events.</p>
                    </section>
                )}

                {/* Risk Insights */}
                {hasRiskData && (
                    <section className="card risk-meter-card">
                        <div className="section-header compact">
                            <h2>Risk Insights</h2>
                        </div>
                        <p className="subtle-text">
                            Risk is currently marked as <strong>{dashboardView.riskLevel}</strong> based on exposure,
                            repayment behaviour, and BNPL activity across providers.
                        </p>
                        <p className="subtle-text">
                            The speedometer is shown only in the Risk Level block in the header.
                        </p>
                    </section>
                )}
            </div>}

            {/* Provider Loans Overview */}
            {loans.length > 0 && (
                <section className="card">
                    <div className="section-header">
                        <h2>Active BNPL Plans by Provider</h2>
                    </div>

                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Provider</th>
                                    <th>Product</th>
                                    <th>Amount</th>
                                    <th>Monthly Payment</th>
                                    <th>Status</th>
                                    <th>Plan ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loans.map((loan) => (
                                    <tr key={loan.loanId}>
                                        <td>{loan.bankName}</td>
                                        <td>{loan.product}</td>
                                        <td>{formatMoney(loan.principalAmount)}</td>
                                        <td>{formatMoney(loan.emiAmount)}</td>
                                        <td>
                                            <span className={`badge ${statusBadgeMap[loan.paymentStatus]}`}>{loan.paymentStatus}</span>
                                        </td>
                                        <td>{loan.loanId}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Provider Details */}
            {providers.length > 0 && (
                <section className="card">
                    <div className="section-header">
                        <h2>Provider Ledger Details</h2>
                    </div>

                    <div className="provider-grid">
                        {providers.map((provider, providerIndex) => {
                            const providerEvents = Array.isArray(provider.ledgerEvents) ? provider.ledgerEvents : [];
                            const onTimeEvents = providerEvents.filter((e) => e.eventType === "ON_TIME_PAYMENT").length;
                            const totalEvents = providerEvents.filter(
                                (e) => e.eventType === "ON_TIME_PAYMENT" || e.eventType === "MISSED_INSTALLMENT"
                            ).length;
                            const paymentPercentage = totalEvents > 0 ? Math.round((onTimeEvents / totalEvents) * 100) : 0;

                            return (
                                <article className="provider-card" key={provider.provider || `provider-${providerIndex}`}>
                                    <div className="provider-header">
                                        <h3>{provider.provider}</h3>
                                        <span className={`badge ${paymentPercentage === 100 ? "badge-success" : "badge-warning"}`}>
                                            {paymentPercentage}% On-time
                                        </span>
                                    </div>

                                    <div className="provider-metrics">
                                        {hasNumber(provider.exposure) && (
                                            <div>
                                                <p className="meta-label">Exposure</p>
                                                <p className="meta-value">{formatMoney(provider.exposure)}</p>
                                            </div>
                                        )}
                                        {hasNumber(provider.monthlyCommitment) && (
                                            <div>
                                                <p className="meta-label">Monthly Commitment</p>
                                                <p className="meta-value">{formatMoney(provider.monthlyCommitment)}</p>
                                            </div>
                                        )}
                                        {hasNumber(provider.missedInstallments) && (
                                            <div>
                                                <p className="meta-label">Missed Payments</p>
                                                <p className="meta-value">{provider.missedInstallments}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="meta-label">Active Plans</p>
                                            <p className="meta-value">{Array.isArray(provider.activePlans) ? provider.activePlans.length : 0}</p>
                                        </div>
                                    </div>

                                    {providerEvents.length > 0 && (
                                        <div className="ledger-events">
                                            <p className="eyebrow">Recent Ledger Events</p>
                                            {providerEvents.slice(0, 3).map((event, idx) => (
                                                <div className="event-item" key={`${provider.provider}-${idx}`}>
                                                    <span>{event.eventType.replaceAll("_", " ")}</span>
                                                    <small>{formatMoney(event.amount)} • {event.date}</small>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                </section>
            )}

            <div className="action-row">
                <button
                    type="button"
                    className="action-btn secondary"
                    onClick={() => onBackToHome?.()}
                >
                    Back to Home
                </button>
            </div>
        </main>
    );
};

export default BNPLDashboard;