// pages/Privacy.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Trash2, Globe, Mail, LockIcon, InfoIcon, LocateIcon, Locate, LocationEditIcon, Cookie, Server, UserCircle, ChartArea } from 'lucide-react';

const Privacy = () => {
    const sections = [
        { id: 'intro', title: '1. Introduction' },
        { id: 'definitions', title: '2. Definitions' },
        { id: 'collect', title: '3. Information We Collect' },
        { id: 'use', title: '4. How We Use Your Information' },
        { id: 'legal-bases', title: '5. Legal Bases for Processing' },
        { id: 'share', title: '6. How We Share Your Information' },
        { id: 'retention', title: '7. Data Retention' },
        { id: 'security', title: '8. Data Security' },
        { id: 'rights', title: '9. Your Rights' },
        { id: 'cookies', title: '10. Cookies and Tracking' },
        { id: 'transfers', title: '11. International Data Transfers' },
        { id: 'children', title: '12. Children\'s Privacy' },
        { id: 'changes', title: '13. Changes to This Policy' },
        { id: 'contact', title: '14. Contact Us' },
    ];

    const lastUpdated = 'September 15, 2026';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                    <div className="mt-4 flex flex-col md:flex-row items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                                Privacy Policy
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                Last updated: {lastUpdated}
                            </p>
                        </div>
                        <img className='w-1/2 md:w-1/4' src="./logo.png" alt="icon"/>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
                    {/* Table of contents — sticky on desktop */}
                    <aside className="lg:col-span-1">
                        <div className="lg:sticky lg:top-24">
                            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-3">
                                On this page
                            </p>
                            <nav className="space-y-1">
                                {sections.map((s) => (
                                    <a
                                        key={s.id}
                                        href={`#${s.id}`}
                                        className="block text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 py-1 transition-colors"
                                    >
                                        {s.title}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Content */}
                    <main className="lg:col-span-3 prose prose-slate dark:prose-invert max-w-none
                                     prose-headings:text-slate-800 dark:prose-headings:text-white
                                     prose-p:text-slate-700 dark:prose-p:text-slate-300
                                     prose-a:text-indigo-600 dark:prose-a:text-indigo-400
                                     prose-strong:text-slate-800 dark:prose-strong:text-white
                                     prose-table:text-sm
                                     prose-th:bg-slate-100 dark:prose-th:bg-slate-800
                                     prose-td:border-slate-200 dark:prose-td:border-slate-700">
                        <Section id="intro" icon={Shield} title="1. Introduction">
                            <p>
                                Welcome to <strong>Converge</strong> platform.
                                We are committed to protecting your privacy and handling your personal data
                                transparently and responsibly.
                            </p>
                            <p>This Privacy Policy explains:</p>
                            <ul>
                                <li>What personal data we collect</li>
                                <li>Why we collect it</li>
                                <li>How we use, store, and share it</li>
                                <li>Your rights over your data</li>
                                <li>How to contact us</li>
                            </ul>
                            <p>
                                By using <strong>Converge</strong>, you agree to the practices described
                                in this policy. If you do not agree, please do not use the Platform.
                            </p>
                            <p className="text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                                <strong>Data Controller:</strong> Converge, Sri Lanka.<br />
                                <strong>Contact:</strong> sandiththenuja2005@gmail.com
                            </p>
                        </Section>

                        <Section id="definitions" icon={LockIcon} title="2. Definitions">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th className="text-left p-2">Term</th>
                                            <th className="text-left p-2">Meaning</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="p-2"><strong>Personal Data</strong></td><td className="p-2">Any information that identifies or can identify you as an individual</td></tr>
                                        <tr><td className="p-2"><strong>Processing</strong></td><td className="p-2">Any operation performed on Personal Data (collection, storage, use, etc.)</td></tr>
                                        <tr><td className="p-2"><strong>User</strong></td><td className="p-2">Anyone who accesses or uses the Platform</td></tr>
                                        <tr><td className="p-2"><strong>Team</strong></td><td className="p-2">A group of Users collaborating within the Platform</td></tr>
                                        <tr><td className="p-2"><strong>Content</strong></td><td className="p-2">Data you upload, create, or share (tasks, files, messages, canvas)</td></tr>
                                        <tr><td className="p-2"><strong>Services</strong></td><td className="p-2">All features offered through the Platform</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </Section>

                        <Section id="collect" icon={Eye} title="3. Information We Collect">
                            <h3>3.1 Information you provide directly</h3>
                            <p><strong>Account information:</strong></p>
                            <ul>
                                <li>Full name</li>
                                <li>Email address</li>
                                <li>Password (hashed, never stored in plaintext)</li>
                                <li>Profile picture (optional)</li>
                                <li>Job title or role (optional)</li>
                                <li>Time zone</li>
                            </ul>

                            <p><strong>Content you create:</strong></p>
                            <ul>
                                <li>Tasks, task titles, descriptions, due dates</li>
                                <li>Team names and descriptions</li>
                                <li>Messages in team chat</li>
                                <li>Files you upload (documents, images, etc.)</li>
                                <li>Canvas drawings and annotations</li>
                                <li>Comments and reactions</li>
                            </ul>

                            <p><strong>Billing information (if applicable):</strong></p>
                            <ul>
                                <li>Billing name and address</li>
                                <li>Payment method (processed by our payment provider — we do not store full card numbers)</li>
                                <li>Tax ID (for invoicing)</li>
                            </ul>

                            <p><strong>Communications:</strong></p>
                            <ul>
                                <li>Emails and messages you send to our support team</li>
                                <li>Feedback or survey responses</li>
                            </ul>

                            <h3>3.2 Information we collect automatically</h3>
                            <p><strong>Usage data:</strong></p>
                            <ul>
                                <li>Pages viewed, features used</li>
                                <li>Clicks, scroll behavior (anonymized)</li>
                                <li>Time spent in the Platform</li>
                                <li>Referring URLs</li>
                            </ul>

                            <p><strong>Device and connection data:</strong></p>
                            <ul>
                                <li>IP address</li>
                                <li>Browser type and version</li>
                                <li>Operating system</li>
                                <li>Device type (desktop, mobile, tablet)</li>
                                <li>Screen resolution</li>
                            </ul>

                            <p><strong>Log data:</strong></p>
                            <ul>
                                <li>Timestamps of actions</li>
                                <li>API requests</li>
                                <li>Error logs</li>
                            </ul>

                            <h3>3.3 Information from third parties</h3>
                            <ul>
                                <li><strong>Authentication providers</strong> (Google, GitHub, Microsoft) — name, email, profile picture</li>
                                <li><strong>Payment processors</strong> (Stripe, PayPal if applicable) — payment status only</li>
                                <li><strong>Analytics providers</strong> — aggregated usage data</li>
                            </ul>
                        </Section>

                        <Section id="use" icon={InfoIcon} title="4. How We Use Your Information">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th className="text-left p-2">Purpose</th>
                                            <th className="text-left p-2">Legal Basis (GDPR)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="p-2">Provide and operate the Platform</td><td className="p-2">Contract performance</td></tr>
                                        <tr><td className="p-2">Create and manage your account</td><td className="p-2">Contract performance</td></tr>
                                        <tr><td className="p-2">Enable team collaboration features</td><td className="p-2">Contract performance</td></tr>
                                        <tr><td className="p-2">Send transactional emails</td><td className="p-2">Contract performance</td></tr>
                                        <tr><td className="p-2">Send product updates</td><td className="p-2">Legitimate interest / consent</td></tr>
                                        <tr><td className="p-2">Process payments</td><td className="p-2">Contract performance</td></tr>
                                        <tr><td className="p-2">Improve the Platform</td><td className="p-2">Legitimate interest</td></tr>
                                        <tr><td className="p-2">Prevent fraud and abuse</td><td className="p-2">Legitimate interest</td></tr>
                                        <tr><td className="p-2">Comply with legal obligations</td><td className="p-2">Legal obligation</td></tr>
                                        <tr><td className="p-2">Respond to support requests</td><td className="p-2">Legitimate interest / contract</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-4">
                                We <strong>do not</strong> sell your personal data to third parties.
                            </p>
                        </Section>

                        <Section id="legal-bases" icon={Locate} title="5. Legal Bases for Processing (GDPR)">
                            <p>If you are in the EEA, UK, or Switzerland, we process your data based on:</p>
                            <ul>
                                <li><strong>Contract:</strong> To provide the Services you've requested</li>
                                <li><strong>Legitimate Interests:</strong> To improve, secure, and operate the Platform</li>
                                <li><strong>Consent:</strong> For marketing emails or optional features (you can withdraw anytime)</li>
                                <li><strong>Legal Obligation:</strong> To comply with tax, accounting, and legal requirements</li>
                            </ul>
                        </Section>

                        <Section id="share" icon={Globe} title="6. How We Share Your Information">
                            <h3>6.1 Within your teams</h3>
                            <ul>
                                <li><strong>Team members</strong> see your name, email, profile picture, and content you share</li>
                                <li><strong>Team admins</strong> see member lists, activity, and content</li>
                                <li><strong>Non-members</strong> cannot access team data unless you invite them</li>
                            </ul>

                            <h3>6.2 Service providers (sub-processors)</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th className="text-left p-2">Provider type</th>
                                            <th className="text-left p-2">Purpose</th>
                                            <th className="text-left p-2">Examples</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="p-2">Cloud hosting</td><td className="p-2">Store data and serve the app</td><td className="p-2">AWS, Google Cloud, Azure</td></tr>
                                        <tr><td className="p-2">Email delivery</td><td className="p-2">Send transactional emails</td><td className="p-2">SendGrid, Postmark</td></tr>
                                        <tr><td className="p-2">Payment processing</td><td className="p-2">Handle billing</td><td className="p-2">Stripe, Paddle</td></tr>
                                        <tr><td className="p-2">Analytics</td><td className="p-2">Understand usage</td><td className="p-2">PostHog, Plausible</td></tr>
                                        <tr><td className="p-2">Error monitoring</td><td className="p-2">Detect issues</td><td className="p-2">Sentry</td></tr>
                                        <tr><td className="p-2">File storage</td><td className="p-2">Host uploads</td><td className="p-2">Cloudinary, S3</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-3">Each provider is contractually bound to protect your data.</p>

                            <h3>6.3 Legal disclosures</h3>
                            <p>We may disclose data if required by:</p>
                            <ul>
                                <li>Court order, subpoena, or legal process</li>
                                <li>Government or regulatory authority</li>
                                <li>To protect rights, safety, or property</li>
                            </ul>
                            <p>We will notify you unless legally prohibited.</p>

                            <h3>6.4 Business transfers</h3>
                            <p>
                                If we are acquired or merged, your data may transfer to the new entity.
                                You will be notified.
                            </p>
                        </Section>

                        <Section id="retention" icon={Trash2} title="7. Data Retention">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th className="text-left p-2">Data type</th>
                                            <th className="text-left p-2">Retention period</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="p-2">Active account data</td><td className="p-2">Until you delete your account</td></tr>
                                        <tr><td className="p-2">Deleted account data</td><td className="p-2">Purged within 30 days</td></tr>
                                        <tr><td className="p-2">Backups</td><td className="p-2">Up to 90 days after deletion</td></tr>
                                        <tr><td className="p-2">Billing records</td><td className="p-2">7 years (tax requirement)</td></tr>
                                        <tr><td className="p-2">Log data</td><td className="p-2">90 days</td></tr>
                                        <tr><td className="p-2">Marketing preferences</td><td className="p-2">Until you unsubscribe</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-3">
                                When retention ends, we securely delete or anonymize data.
                            </p>
                        </Section>

                        <Section id="security" icon={Lock} title="8. Data Security">
                            <p>We protect your data using:</p>
                            <ul>
                                <li><strong>Encryption in transit:</strong> TLS 1.3</li>
                                <li><strong>Encryption at rest:</strong> AES-256 for stored data</li>
                                <li><strong>Password hashing:</strong> bcrypt (industry standard)</li>
                                <li><strong>Access controls:</strong> Role-based permissions, principle of least privilege</li>
                                <li><strong>Monitoring:</strong> Continuous logging and anomaly detection</li>
                                <li><strong>Backups:</strong> Daily encrypted backups</li>
                                <li><strong>Employee training:</strong> Regular security awareness</li>
                            </ul>
                            <p className="text-sm bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 rounded-lg">
                                <strong>No system is 100% secure.</strong> If a breach occurs, we will notify
                                affected users and regulators within 72 hours as required by law.
                            </p>
                        </Section>

                        <Section id="rights" icon={LocationEditIcon} title="9. Your Rights">
                            <p>Depending on your location, you may have the right to:</p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th className="text-left p-2">Right</th>
                                            <th className="text-left p-2">What it means</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="p-2"><strong>Access</strong></td><td className="p-2">Get a copy of your personal data</td></tr>
                                        <tr><td className="p-2"><strong>Rectification</strong></td><td className="p-2">Correct inaccurate data</td></tr>
                                        <tr><td className="p-2"><strong>Erasure</strong></td><td className="p-2">Delete your data ("right to be forgotten")</td></tr>
                                        <tr><td className="p-2"><strong>Restriction</strong></td><td className="p-2">Limit how we process your data</td></tr>
                                        <tr><td className="p-2"><strong>Portability</strong></td><td className="p-2">Export your data in a machine-readable format</td></tr>
                                        <tr><td className="p-2"><strong>Object</strong></td><td className="p-2">Object to processing based on legitimate interest</td></tr>
                                        <tr><td className="p-2"><strong>Withdraw consent</strong></td><td className="p-2">Stop consent-based processing at any time</td></tr>
                                        <tr><td className="p-2"><strong>Lodge a complaint</strong></td><td className="p-2">Contact your local data protection authority</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-4">
                                To exercise any right, email <strong>sandiththenuja2005@gmail.com</strong>. We respond within 30 days.
                            </p>
                            <p className="text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded-lg mt-3">
                                <strong>California residents (CCPA/CPRA):</strong> You have additional rights
                                including the right to know, the right to delete, the right to opt out of the
                                "sale" of personal information (we do not sell), and the right to
                                non-discrimination.
                            </p>
                        </Section>

                        <Section id="cookies" icon={Cookie} title="10. Cookies and Tracking">
                            <p>We use cookies and similar technologies for:</p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th className="text-left p-2">Type</th>
                                            <th className="text-left p-2">Purpose</th>
                                            <th className="text-left p-2">Can disable?</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="p-2">Essential</td><td className="p-2">Login, session management</td><td className="p-2">No</td></tr>
                                        <tr><td className="p-2">Functional</td><td className="p-2">Remember preferences</td><td className="p-2">Yes</td></tr>
                                        <tr><td className="p-2">Analytics</td><td className="p-2">Understand usage</td><td className="p-2">Yes</td></tr>
                                        <tr><td className="p-2">Marketing</td><td className="p-2">Ad targeting (if applicable)</td><td className="p-2">Yes</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-3">
                                Manage cookies in your browser settings or via our cookie banner.
                            </p>
                        </Section>

                        <Section id="transfers" icon={Server} title="11. International Data Transfers">
                            <p>
                                Our servers are located in <strong>Sri Lanka</strong> id stored. If you access the
                                Platform from another region, your data may be transferred internationally.
                            </p>
                            <p>We use safeguards:</p>
                            <ul>
                                <li><strong>Standard Contractual Clauses (SCCs)</strong> approved by the EU</li>
                                <li><strong>Adequacy decisions</strong> where applicable</li>
                                <li><strong>Encryption</strong> during transfer</li>
                            </ul>
                        </Section>

                        <Section id="children" icon={UserCircle} title="12. Children's Privacy">
                            <p>
                                The Platform is <strong>not intended for children under 16</strong> (or 13 in
                                some jurisdictions).
                            </p>
                            <p>
                                We do not knowingly collect data from children. If you believe a child has
                                provided us data, contact <strong>sandiththenuja2005@gmail.com</strong> and we will delete it.
                            </p>
                        </Section>

                        <Section id="changes" icon={ChartArea} title="13. Changes to This Policy">
                            <p>We may update this policy. If changes are material:</p>
                            <ul>
                                <li>We will notify you by email or in-app</li>
                                <li>We will update the "Last updated" date</li>
                            </ul>
                            <p>Continued use after changes means you accept the updated policy.</p>
                        </Section>

                        <Section id="contact" icon={Mail} title="14. Contact Us">
                            <p>For privacy questions, requests, or complaints:</p>
                            <ul>
                                <li><strong>Email:</strong> sandiththenuja2005@gmail.com</li>
                                {/* <li><strong>Mail:</strong> [COMPANY LEGAL NAME], [ADDRESS]</li> */}
                                {/* <li><strong>Data Protection Officer (if applicable):</strong> [DPO EMAIL]</li> */}
                            </ul>
                            <p>
                                If you are unsatisfied with our response, you can contact your local data
                                protection authority.
                            </p>
                        </Section>

                        {/* Footer card */}
                        <div className="not-prose mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">
                                Questions about your privacy?
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                We're here to help. Reach out and we'll respond within 30 days.
                            </p>
                            <a
                                href="mailto:sandiththenuja2005@gmail.com"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <Mail className="w-4 h-4" />
                                Contact Privacy Team
                            </a>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

const Section = ({ id, icon: Icon, title, children }) => (
    <section id={id} className="scroll-mt-24 mb-10">
        <div className="flex items-center gap-3 mb-4">
            {Icon && (
                <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
            )}
            <h2 className="!my-0 !text-xl md:!text-2xl font-bold">{title}</h2>
        </div>
        <div className="space-y-4">{children}</div>
    </section>
);

export default Privacy;