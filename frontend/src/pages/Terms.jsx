// pages/Terms.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, ScrollText, Scale, AlertCircle, Ban, Copyright, Gavel, Mail, UserCheck, User2Icon, UserCircle2, Currency, DollarSign, Database, Edit, ServerCogIcon, LockOpen, FileWarning, UserCircle, UserKey, UserLock } from 'lucide-react';

const Terms = () => {
    const sections = [
        { id: 'agreement', title: '1. Agreement to Terms' },
        { id: 'eligibility', title: '2. Eligibility' },
        { id: 'account', title: '3. Account Registration' },
        { id: 'service', title: '4. The Service' },
        { id: 'payments', title: '5. Subscriptions and Payments' },
        { id: 'acceptable-use', title: '6. Acceptable Use' },
        { id: 'content', title: '7. Your Content' },
        { id: 'teams', title: '8. Team and Collaboration Rules' },
        { id: 'ip', title: '9. Intellectual Property' },
        { id: 'third-party', title: '10. Third-Party Services' },
        { id: 'disclaimers', title: '11. Disclaimers' },
        { id: 'liability', title: '12. Limitation of Liability' },
        { id: 'indemnification', title: '13. Indemnification' },
        { id: 'termination', title: '14. Termination' },
        { id: 'disputes', title: '15. Dispute Resolution' },
        { id: 'changes', title: '16. Changes to Terms' },
        { id: 'misc', title: '17. Miscellaneous' },
        { id: 'contact', title: '18. Contact' },
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
                            <ScrollText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                                Terms of Service
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
                    {/* Table of contents */}
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
                        <Section id="agreement" icon={FileText} title="1. Agreement to Terms">
                            <p>
                                These Terms of Service ("Terms") govern your access to and use of{' '}
                                <strong>Converge</strong> (the "Service"), operated by{' '}
                                <strong>Converge</strong> ("we", "us", "our").
                            </p>
                            <p>
                                By creating an account or using the Service, you agree to these Terms. If
                                you do not agree, do not use the Service.
                            </p>
                            <p className="text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                                If you are using the Service on behalf of an organization, you represent
                                that you have authority to bind that organization, and "you" refers to
                                both you and the organization.
                            </p>
                        </Section>

                        <Section id="eligibility" icon={UserCheck} title="2. Eligibility">
                            <p>To use the Service, you must:</p>
                            <ul>
                                <li>Be at least 16 years old (or the age of majority in your jurisdiction)</li>
                                <li>Have the legal capacity to enter into a binding contract</li>
                                <li>Not be barred from using the Service under applicable law</li>
                            </ul>
                        </Section>

                        <Section id="account" icon={User2Icon} title="3. Account Registration">
                            <h3>3.1 Your responsibilities</h3>
                            <ul>
                                <li>Provide accurate, current information</li>
                                <li>Keep your password confidential</li>
                                <li>Notify us immediately of unauthorized use</li>
                                <li>You are responsible for all activity under your account</li>
                            </ul>

                            <h3>3.2 Account security</h3>
                            <ul>
                                <li>Use a strong, unique password</li>
                                <li>Enable two-factor authentication if available</li>
                                <li>Do not share your credentials</li>
                            </ul>

                            <h3>3.3 One account per person</h3>
                            <p>
                                Unless we approve otherwise, each user should have one account. Team
                                accounts are managed by team admins.
                            </p>
                        </Section>

                        <Section id="service" icon={UserCircle2} title="4. The Service">
                            <h3>4.1 What we provide</h3>
                            <p>
                                <strong>Converge</strong> is a collaboration platform that includes:
                            </p>
                            <ul>
                                <li>Task and project management</li>
                                <li>Team workspaces</li>
                                <li>Real-time chat and messaging</li>
                                <li>File storage and sharing</li>
                                <li>Collaborative canvas/drawing</li>
                                <li>Reports and analytics</li>
                                <li>Calendar and scheduling</li>
                            </ul>

                            <h3>4.2 Availability</h3>
                            <p>
                                We aim for high availability but do not guarantee uninterrupted service.
                                We may:
                            </p>
                            <ul>
                                <li>Perform scheduled maintenance (with notice)</li>
                                <li>Perform emergency maintenance (without notice)</li>
                                <li>Modify, suspend, or discontinue features</li>
                            </ul>

                            <h3>4.3 Beta features</h3>
                            <p>
                                Some features may be labeled "beta" or "experimental." These are provided
                                "as is" and may change or be removed without notice.
                            </p>
                        </Section>

                        <Section id="payments" icon={DollarSign} title="5. Subscriptions and Payments">
                            <h3>5.1 Free and paid plans</h3>
                            <p>We offer free and paid plans. Paid plans are billed in advance.</p>

                            <h3>5.2 Billing</h3>
                            <ul>
                                <li>All fees are in <strong>dollars</strong></li>
                                <li>Payment is due on the billing date</li>
                                <li>Failed payments may result in suspension</li>
                                <li>You are responsible for taxes (except where we are required to collect)</li>
                            </ul>

                            <h3>5.3 Auto-renewal</h3>
                            <p>
                                Paid subscriptions renew automatically unless canceled before the renewal
                                date.
                            </p>

                            <h3>5.4 Refunds</h3>
                            <ul>
                                <li>Free trial periods are non-refundable</li>
                                <li>Monthly subscriptions are non-refundable after use</li>
                                <li>Annual subscriptions may be refunded on a pro-rata basis within 14 days</li>
                                <li>Exceptions at our discretion</li>
                            </ul>

                            <h3>5.5 Price changes</h3>
                            <p>
                                We may change prices with 30 days' notice. Continued use means you accept
                                new prices.
                            </p>

                            <h3>5.6 Cancellation</h3>
                            <p>
                                You can cancel anytime in your account settings. Access continues until
                                the end of the paid period.
                            </p>
                        </Section>

                        <Section id="acceptable-use" icon={Ban} title="6. Acceptable Use">
                            <p>You agree <strong>not</strong> to:</p>
                            <ul>
                                <li>Violate any law or regulation</li>
                                <li>Infringe intellectual property rights</li>
                                <li>Upload malware, viruses, or harmful code</li>
                                <li>Attempt to gain unauthorized access</li>
                                <li>Interfere with the Service (DDoS, scraping, etc.)</li>
                                <li>Reverse engineer or copy the Service</li>
                                <li>Use the Service to spam or phish</li>
                                <li>Harass, threaten, or abuse others</li>
                                <li>Upload illegal content</li>
                                <li>Impersonate others</li>
                                <li>Use automated tools to mass-create accounts</li>
                                <li>Resell the Service without permission</li>
                            </ul>
                            <p>We may suspend or terminate accounts that violate these rules.</p>
                        </Section>

                        <Section id="content" icon={Database} title="7. Your Content">
                            <h3>7.1 Ownership</h3>
                            <p>You retain ownership of all content you create or upload ("Your Content").</p>

                            <h3>7.2 License to us</h3>
                            <p>
                                By uploading content, you grant us a worldwide, non-exclusive, royalty-free
                                license to:
                            </p>
                            <ul>
                                <li>Store, process, and display your content</li>
                                <li>Make backups</li>
                                <li>Deliver it to your team members</li>
                                <li>Improve the Service (in anonymized, aggregated form)</li>
                            </ul>
                            <p>
                                This license ends when you delete your content, except where retention is
                                required by law.
                            </p>

                            <h3>7.3 Your responsibility</h3>
                            <p>You are solely responsible for:</p>
                            <ul>
                                <li>The legality of your content</li>
                                <li>Ensuring you have rights to upload it</li>
                                <li>Not uploading confidential data you're not authorized to share</li>
                            </ul>

                            <h3>7.4 Our rights to remove content</h3>
                            <p>We may remove content that:</p>
                            <ul>
                                <li>Violates these Terms</li>
                                <li>Infringes rights</li>
                                <li>Is reported as illegal</li>
                                <li>Poses security or legal risk</li>
                            </ul>
                            <p>We will notify you unless prohibited by law.</p>
                        </Section>

                        <Section id="teams" icon={Edit} title="8. Team and Collaboration Rules">
                            <h3>8.1 Team admins</h3>
                            <ul>
                                <li>Team admins control membership and settings</li>
                                <li>Admins can remove members and their access</li>
                                <li>Admins can view team activity and content</li>
                            </ul>

                            <h3>8.2 Leaving a team</h3>
                            <ul>
                                <li>You can leave a team at any time (unless you're the sole admin)</li>
                                <li>Your content may remain visible to the team after you leave</li>
                                <li>Contact team admins to request content removal</li>
                            </ul>

                            <h3>8.3 Deleting a team</h3>
                            <ul>
                                <li>Only admins can delete a team</li>
                                <li>Deletion removes all team content</li>
                                <li>Deletion is irreversible after the grace period (if any)</li>
                            </ul>
                        </Section>

                        <Section id="ip" icon={Copyright} title="9. Intellectual Property">
                            <h3>9.1 Our IP</h3>
                            <p>
                                The Service, including all software, design, logos, and documentation, is
                                owned by us or our licensors. You may not copy, modify, or distribute it
                                without permission.
                            </p>

                            <h3>9.2 Trademarks</h3>
                            <p>
                                <strong>[PLATFORM NAME]</strong> and our logo are trademarks. You may not
                                use them without written permission.
                            </p>

                            <h3>9.3 Feedback</h3>
                            <p>
                                If you send us suggestions or feedback, we may use them without obligation
                                or compensation.
                            </p>
                        </Section>

                        <Section id="third-party" icon={ServerCogIcon} title="10. Third-Party Services">
                            <p>
                                The Service may integrate with third parties (Google, Slack, etc.). Your
                                use of those services is governed by their terms. We are not responsible
                                for third-party services.
                            </p>
                        </Section>

                        <Section id="disclaimers" icon={AlertCircle} title="11. Disclaimers">
                            <p className="text-sm bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-lg">
                                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF
                                ANY KIND, EXPRESS OR IMPLIED, INCLUDING:
                            </p>
                            <ul>
                                <li>Merchantability</li>
                                <li>Fitness for a particular purpose</li>
                                <li>Non-infringement</li>
                                <li>Uninterrupted or error-free operation</li>
                                <li>Accuracy of results</li>
                            </ul>
                            <p>We do not warrant that:</p>
                            <ul>
                                <li>The Service will meet your requirements</li>
                                <li>Data will be secure or not lost</li>
                                <li>Errors will be corrected</li>
                            </ul>
                        </Section>

                        <Section id="liability" icon={Scale} title="12. Limitation of Liability">
                            <p className="text-sm bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-lg">
                                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
                            </p>
                            <ul>
                                <li>We are not liable for indirect, incidental, special, consequential, or punitive damages</li>
                                <li>Our total liability is limited to the amount you paid us in the 12 months preceding the claim</li>
                                <li>This applies regardless of legal theory</li>
                            </ul>

                            <p><strong>Exceptions:</strong> Nothing limits liability for:</p>
                            <ul>
                                <li>Death or personal injury caused by negligence</li>
                                <li>Fraud or fraudulent misrepresentation</li>
                                <li>Anything else that cannot be limited by law</li>
                            </ul>
                        </Section>

                        <Section id="indemnification" icon={LockOpen} title="13. Indemnification">
                            <p>
                                You agree to indemnify us against claims, damages, and expenses (including
                                legal fees) arising from:
                            </p>
                            <ul>
                                <li>Your use of the Service</li>
                                <li>Your content</li>
                                <li>Your violation of these Terms</li>
                                <li>Your violation of any third-party rights</li>
                            </ul>
                        </Section>

                        <Section id="termination" icon={FileWarning} title="14. Termination">
                            <h3>14.1 By you</h3>
                            <p>You can stop using the Service at any time and delete your account.</p>

                            <h3>14.2 By us</h3>
                            <p>We may suspend or terminate your access if:</p>
                            <ul>
                                <li>You violate these Terms</li>
                                <li>You fail to pay</li>
                                <li>We are required by law</li>
                                <li>We discontinue the Service</li>
                            </ul>

                            <h3>14.3 Effect of termination</h3>
                            <ul>
                                <li>Your right to use the Service ends</li>
                                <li>We may delete your data after the retention period</li>
                                <li>Sections on IP, liability, indemnity, and disputes survive</li>
                            </ul>
                        </Section>

                        <Section id="disputes" icon={Gavel} title="15. Dispute Resolution">
                            <h3>15.1 Informal resolution</h3>
                            <p>
                                Before filing a claim, contact us at <strong>sandiththenuja2005@gmail.com</strong> and
                                attempt to resolve the issue.
                            </p>

                            <h3>15.2 Governing law</h3>
                            <p>
                                These Terms are governed by the laws of <strong>Sri Lanka</strong>,
                                without regard to conflict-of-law rules.
                            </p>

                            <h3>15.3 Venue</h3>
                            <p>
                                Exclusive jurisdiction lies in the courts of{' '}
                                <strong>Sri Lanka</strong>, unless mandatory local law says
                                otherwise.
                            </p>

                            <h3>15.4 Class action waiver (US only)</h3>
                            <p>
                                To the extent permitted by law, you waive the right to participate in
                                class actions.
                            </p>

                            <h3>15.5 Arbitration (optional)</h3>
                            <p>
                                If you prefer arbitration, we may mutually agree to resolve disputes
                                through binding arbitration under <strong>rules</strong>.
                            </p>
                        </Section>

                        <Section id="changes" icon={UserLock} title="16. Changes to Terms">
                            <p>
                                We may update these Terms. Material changes will be notified by email or
                                in-app at least <strong>14 days</strong> before they take effect. Continued
                                use means you accept the updated Terms.
                            </p>
                        </Section>

                        <Section id="misc" icon={UserKey} title="17. Miscellaneous">
                            <ul>
                                <li><strong>Entire agreement:</strong> These Terms plus the Privacy Policy are the entire agreement</li>
                                <li><strong>Severability:</strong> If any clause is unenforceable, the rest remains</li>
                                <li><strong>No waiver:</strong> Our failure to enforce a right does not waive it</li>
                                <li><strong>Assignment:</strong> You may not assign these Terms; we may assign freely</li>
                                <li><strong>Force majeure:</strong> We are not liable for delays caused by events beyond our control</li>
                            </ul>
                        </Section>

                        <Section id="contact" icon={Mail} title="18. Contact">
                            <p>For legal questions:</p>
                            <ul>
                                <li><strong>Email:</strong> sandiththenuja2005@gmail.com</li>
                            </ul>
                        </Section>

                        {/* Footer card */}
                        <div className="not-prose mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">
                                Questions about these Terms?
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                Contact our legal team and we'll get back to you.
                            </p>
                            <a
                                href="mailto:sandiththenuja2005@gmail.com"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <Mail className="w-4 h-4" />
                                Contact Legal
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

export default Terms;