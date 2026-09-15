// components/PrivacyPolicyModal.jsx
import React, { useEffect } from 'react';
import { X, Shield, Lock, Eye, Trash2, Globe, Mail, AlertCircle } from 'lucide-react';

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
    // Lock body scroll while open
    useEffect(() => {
        if (!isOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-policy-title"
        >
            <div
                className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 px-5 md:px-6 py-5 flex items-center justify-between rounded-t-2xl z-10 shrink-0">
                    <div className="flex flex-col md:flex-row items-center gap-3 min-w-0">
                        <div className='flex flex-row gap-3'>
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2
                                id="privacy-policy-title"
                                className="text-lg md:text-xl font-bold text-white truncate"
                            >
                                Privacy Policy
                            </h2>
                            <p className="text-xs text-white/70">
                                Last updated: September 15, 2026
                            </p>
                        </div>
                        </div>
                        <img className='w-1/2 md:w-1/4' src="./logo.png" alt="icon"/>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="p-2 hidden md:block rounded-lg hover:bg-white/20 transition-colors shrink-0"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Body — scrollable */}
                <div className="flex-1 overflow-y-auto px-5 md:px-6 py-5 space-y-6">
                    {/* Intro */}
                    <section>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            Welcome to <strong>Converge</strong> ("we", "us", "our", or "the
                            Platform"). We are committed to protecting your privacy and handling your
                            personal data transparently and responsibly.
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-2">
                            This Privacy Policy explains what data we collect, why we collect it, how
                            we use and share it, and the rights you have over your data. By using{' '}
                            <strong>Converge</strong>, you agree to these practices.
                        </p>
                        <div className="mt-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                            <p className="text-xs text-indigo-700 dark:text-indigo-300">
                                <strong>Data Controller:</strong> Converge, Sri Lanka
                                <br />
                                <strong>Contact:</strong>{' '}
                                <a
                                    href="mailto:sandiththenuja2005@gmail.com"
                                    className="underline hover:no-underline"
                                >
                                    sandiththenuja2005@gmail.com
                                </a>
                            </p>
                        </div>
                    </section>

                    {/* 1. Information We Collect */}
                    <Section title="1. Information We Collect">
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">
                            Information you provide directly
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <li><strong>Account data:</strong> full name, email address, hashed password, profile picture (optional), time zone</li>
                            <li><strong>Content you create:</strong> tasks, task descriptions, team names, chat messages, uploaded files, canvas drawings, comments</li>
                            <li><strong>Billing data:</strong> name, address, payment status (card details are handled by our payment provider)</li>
                            <li><strong>Communications:</strong> support emails, feedback, survey responses</li>
                        </ul>

                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-3">
                            Information collected automatically
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <li><strong>Usage:</strong> pages viewed, features used, time spent, anonymized click/scroll behavior</li>
                            <li><strong>Device:</strong> IP address, browser and OS, device type, screen resolution</li>
                            <li><strong>Logs:</strong> timestamps, API requests, error logs</li>
                        </ul>

                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-3">
                            Information from third parties
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <li><strong>Auth providers</strong> (Google, GitHub, Microsoft) — name, email, profile picture</li>
                            <li><strong>Payment processors</strong> (Stripe, PayPal) — payment status only</li>
                            <li><strong>Analytics providers</strong> — aggregated usage data</li>
                        </ul>
                    </Section>

                    {/* 2. How We Use It */}
                    <Section title="2. How We Use Your Information">
                        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <li>Provide and operate the Platform</li>
                            <li>Create and manage your account</li>
                            <li>Enable team collaboration features</li>
                            <li>Send transactional emails (password reset, invites)</li>
                            <li>Send product updates and announcements (with consent)</li>
                            <li>Process payments</li>
                            <li>Improve the Platform through analytics and bug fixes</li>
                            <li>Prevent fraud and abuse</li>
                            <li>Comply with legal obligations</li>
                            <li>Respond to support requests</li>
                        </ul>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                            We <strong>do not sell</strong> your personal data. We <strong>do not use</strong>{' '}
                            your content to train AI models unless you explicitly opt in.
                        </p>
                    </Section>

                    {/* 3. Sharing */}
                    <Section title="3. How We Share Your Information">
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            Within your teams
                        </h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                            Team members see your name, email, profile picture, and shared content.
                            Team admins can see member lists and activity. Non-members cannot access
                            team data unless invited.
                        </p>

                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-3">
                            Service providers (sub-processors)
                        </h4>
                        <div className="overflow-x-auto mt-1">
                            <table className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                <thead className="bg-slate-100 dark:bg-slate-800">
                                    <tr>
                                        <th className="text-left p-2 font-semibold text-slate-700 dark:text-slate-300">Type</th>
                                        <th className="text-left p-2 font-semibold text-slate-700 dark:text-slate-300">Purpose</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-600 dark:text-slate-400">
                                    <tr className="border-t border-slate-200 dark:border-slate-700">
                                        <td className="p-2">Cloud hosting</td>
                                        <td className="p-2">Store data, serve the app (AWS, GCP, Azure)</td>
                                    </tr>
                                    <tr className="border-t border-slate-200 dark:border-slate-700">
                                        <td className="p-2">Email delivery</td>
                                        <td className="p-2">Transactional emails (SendGrid, Postmark)</td>
                                    </tr>
                                    <tr className="border-t border-slate-200 dark:border-slate-700">
                                        <td className="p-2">Payment</td>
                                        <td className="p-2">Billing (Stripe, Paddle)</td>
                                    </tr>
                                    <tr className="border-t border-slate-200 dark:border-slate-700">
                                        <td className="p-2">Analytics</td>
                                        <td className="p-2">Usage insights (PostHog, Plausible)</td>
                                    </tr>
                                    <tr className="border-t border-slate-200 dark:border-slate-700">
                                        <td className="p-2">File storage</td>
                                        <td className="p-2">Host uploads (Cloudinary, S3)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-3">
                            Legal disclosures
                        </h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                            We may disclose data when required by court order, subpoena, or
                            government request, or to protect rights and safety. We notify you unless
                            legally prohibited.
                        </p>
                    </Section>

                    {/* 4. Data Retention */}
                    <Section title="4. Data Retention">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                <thead className="bg-slate-100 dark:bg-slate-800">
                                    <tr>
                                        <th className="text-left p-2 font-semibold text-slate-700 dark:text-slate-300">Data</th>
                                        <th className="text-left p-2 font-semibold text-slate-700 dark:text-slate-300">Kept for</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-600 dark:text-slate-400">
                                    <tr className="border-t border-slate-200 dark:border-slate-700"><td className="p-2">Active account data</td><td className="p-2">Until you delete your account</td></tr>
                                    <tr className="border-t border-slate-200 dark:border-slate-700"><td className="p-2">Deleted account data</td><td className="p-2">Purged within 30 days</td></tr>
                                    <tr className="border-t border-slate-200 dark:border-slate-700"><td className="p-2">Backups</td><td className="p-2">Up to 90 days after deletion</td></tr>
                                    <tr className="border-t border-slate-200 dark:border-slate-700"><td className="p-2">Billing records</td><td className="p-2">7 years (tax requirement)</td></tr>
                                    <tr className="border-t border-slate-200 dark:border-slate-700"><td className="p-2">Log data</td><td className="p-2">90 days</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    {/* 5. Security */}
                    <Section title="5. Data Security">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                            We protect your data using:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <li><strong>Encryption in transit:</strong> TLS 1.3</li>
                            <li><strong>Encryption at rest:</strong> AES-256</li>
                            <li><strong>Password hashing:</strong> bcrypt</li>
                            <li><strong>Access controls:</strong> role-based permissions</li>
                            <li><strong>Monitoring:</strong> continuous logging and anomaly detection</li>
                            <li><strong>Backups:</strong> daily, encrypted</li>
                        </ul>
                        <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                No system is 100% secure. If a breach occurs, we notify affected
                                users and regulators within 72 hours as required by law.
                            </p>
                        </div>
                    </Section>

                    {/* 6. Your Rights */}
                    <Section title="6. Your Rights">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                            Depending on your location, you may have the right to:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <li><strong>Access</strong> — get a copy of your data</li>
                            <li><strong>Rectification</strong> — correct inaccurate data</li>
                            <li><strong>Erasure</strong> — delete your data</li>
                            <li><strong>Restriction</strong> — limit processing</li>
                            <li><strong>Portability</strong> — export data in a machine-readable format</li>
                            <li><strong>Object</strong> — object to legitimate-interest processing</li>
                            <li><strong>Withdraw consent</strong> — stop consent-based processing anytime</li>
                            <li><strong>Complain</strong> — contact your local data protection authority</li>
                        </ul>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                            To exercise any right, email{' '}
                            <a
                                href="mailto:sandiththenuja2005@gmail.com"
                                className="text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                sandiththenuja2005@gmail.com
                            </a>
                            . We respond within 30 days.
                        </p>
                    </Section>

                    {/* 7. Cookies */}
                    <Section title="7. Cookies and Tracking">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                            We use essential cookies for login and session management, and
                            optional cookies for preferences and analytics. You can disable
                            non-essential cookies in your browser or via our cookie banner.
                        </p>
                    </Section>

                    {/* 8. Children */}
                    <Section title="8. Children's Privacy">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                            The Platform is not intended for children under 16. We do not
                            knowingly collect data from children. Contact us to request deletion
                            if you believe a child has provided data.
                        </p>
                    </Section>

                    {/* 9. Changes */}
                    <Section title="9. Changes to This Policy">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                            We may update this policy. Material changes will be notified by email
                            or in-app. Continued use means you accept the updated policy.
                        </p>
                    </Section>

                    {/* 10. Contact */}
                    <Section icon={Mail} title="10. Contact Us">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                            For privacy questions or requests:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <li>Email:{' '}
                                <a
                                    href="mailto:sandiththenuja2005@gmail.com"
                                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    sandiththenuja2005@gmail.com
                                </a>
                            </li>
                            {/* <li>Mail: Converge, Sri Lanka</li> */}
                        </ul>
                    </Section>
                </div>

                {/* Footer — actions */}
                <div className="border-t border-slate-200 dark:border-slate-800 px-5 md:px-6 py-4 flex items-center justify-between gap-3 shrink-0 bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                        By using Converge, you agree to this policy.
                    </p>
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all"
                        >
                            I Understand
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Section = ({ icon: Icon, title, children }) => (
    <section className="space-y-2">
        <div className="flex items-center gap-2">
            {Icon && (
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                </div>
            )}
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {title}
            </h3>
        </div>
        <div className="space-y-2 pl-0 md:pl-9">{children}</div>
    </section>
);

export default PrivacyPolicyModal;