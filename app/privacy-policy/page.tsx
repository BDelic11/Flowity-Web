export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <p className="text-sm text-gray-500 mb-8">Last updated: May 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
        <p className="text-gray-700 leading-relaxed">
          We collect information you provide directly to us, such as when you create an account,
          use our services, or contact us for support. This includes your name, email address,
          and any other information you choose to provide.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
        <p className="text-gray-700 leading-relaxed">
          We use the information we collect to provide, maintain, and improve our services,
          process transactions, send you technical notices and support messages, and respond
          to your comments and questions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
        <p className="text-gray-700 leading-relaxed">
          We do not share your personal information with third parties except as described
          in this policy. We may share your information with service providers who assist
          us in operating our platform.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Data Retention</h2>
        <p className="text-gray-700 leading-relaxed">
          We retain your information for as long as your account is active or as needed to
          provide you services. You may request deletion of your data at any time by
          contacting us.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Contact Us</h2>
        <p className="text-gray-700 leading-relaxed">
          If you have any questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:support@flowity-ai.com" className="text-blue-600 hover:underline">
            support@flowity-ai.com
          </a>
          .
        </p>
      </section>
    </main>
  );
}
