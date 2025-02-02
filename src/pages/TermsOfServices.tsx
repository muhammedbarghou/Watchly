import logo from "@/assets/logo.png";

export function TermsOfServices() {
  return (
    <main className="bg-netflix-black">
      <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-start h-screen md:px-8">
        <div className="max-w-3xl mx-auto text-left">
          <div className="pb-6">
            <img src={logo} width={150} className="mx-auto" />
          </div>
          <h3 className="text-gray-100 text-4xl font-semibold sm:text-5xl text-center mb-8">
            Terms of Service and Privacy Policy
          </h3>

          {/* Scrollable Content Section */}
          <div className="overflow-y-auto max-h-[60vh] bg-netflix-dark-gray p-6 rounded-lg shadow-lg">
            {/* Terms of Service Section */}
            <section className="mb-8">
              <h4 className="text-gray-100 text-2xl font-semibold mb-4">
                Terms of Service
              </h4>
              <p className="text-gray-300 mb-4">
                <strong>Last Updated:</strong> 01/02/2025
              </p>

              <h5 className="text-gray-100 text-xl font-semibold mb-2">
                1. Acceptance of Terms
              </h5>
              <p className="text-gray-300 mb-4">
                By using Watchly, you confirm that you are at least 13 years old and have the legal capacity to enter into these Terms. If you do not agree with any part of these Terms, you may not use Watchly.
              </p>

              <h5 className="text-gray-100 text-xl font-semibold mb-2">
                2. Account Registration
              </h5>
              <ul className="text-gray-300 list-disc list-inside mb-4">
                <li>You must create an account to use certain features of Watchly.</li>
                <li>You are responsible for maintaining the security of your account and all activities that occur under it.</li>
                <li>Providing false information or impersonating someone else is strictly prohibited.</li>
              </ul>

              <h5 className="text-gray-100 text-xl font-semibold mb-2">
                3. User Conduct
              </h5>
              <p className="text-gray-300 mb-4">
                You agree not to:
              </p>
              <ul className="text-gray-300 list-disc list-inside mb-4">
                <li>Use Watchly for any illegal or unauthorized purpose.</li>
                <li>Share content that is harmful, obscene, hateful, or violates any third-party rights.</li>
                <li>Attempt to disrupt the platform’s security or functionality.</li>
              </ul>

              <h5 className="text-gray-100 text-xl font-semibold mb-2">
                4. Content and Ownership
              </h5>
              <ul className="text-gray-300 list-disc list-inside mb-4">
                <li>You retain ownership of any content you submit or share on Watchly.</li>
                <li>By sharing content, you grant Watchly a non-exclusive, worldwide license to use, store, and display it.</li>
                <li>Watchly is not responsible for user-generated content and reserves the right to remove any content that violates these Terms.</li>
              </ul>

              <h5 className="text-gray-100 text-xl font-semibold mb-2">
                5. Termination
              </h5>
              <p className="text-gray-300 mb-4">
                We may suspend or terminate your access to Watchly if you violate these Terms or engage in activities that harm the platform or other users.
              </p>

              <h5 className="text-gray-100 text-xl font-semibold mb-2">
                6. Limitation of Liability
              </h5>
              <p className="text-gray-300 mb-4">
                Watchly is provided "as is" without warranties of any kind. We are not responsible for any direct, indirect, or incidental damages arising from your use of the platform.
              </p>

              <h5 className="text-gray-100 text-xl font-semibold mb-2">
                7. Changes to These Terms
              </h5>
              <p className="text-gray-300 mb-4">
                We reserve the right to update these Terms at any time. Continued use of Watchly after changes constitutes acceptance of the new Terms.
              </p>

              <h5 className="text-gray-100 text-xl font-semibold mb-2">
                8. Contact Us
              </h5>
              <p className="text-gray-300 mb-4">
                If you have any questions about these Terms, contact us at [your contact email].
              </p>
            </section>

            {/* Privacy Policy Section */}
            <section>
              <h4 className="text-gray-100 text-2xl font-semibold mb-4">
                Privacy Policy
              </h4>
              <p className="text-gray-300 mb-4">
                <strong>Last Updated:</strong> 02/02/2025
              </p>

              <h5 className="text-gray-100 text-xl font-semibold mb-2">
                1. Information We Collect
              </h5>
              <ul className="text-gray-300 list-disc list-inside mb-4">
                <li><strong>Personal Information:</strong> When you create an account, we may collect your name, email address, and profile picture.</li>
                <li><strong>Usage Data:</strong> We collect information about your interactions with Watchly, such as room participation and viewing history.</li>
                <li><strong>Device Information:</strong> We may collect data about your device, including IP address and browser type.</li>
              </ul>

              <h5 className="text-gray-100 text-xl font-semibold mb-2">
                2. How We Use Your Information
              </h5>
              <p className="text-gray-300 mb-4">
                We use your information to:
              </p>
              <ul className="text-gray-300 list-disc list-inside mb-4">
                <li>Provide and improve Watchly’s services.</li>
                <li>Maintain account security and prevent fraud.</li>
                <li>Communicate with you about updates and support.</li>
                <li>Analyze platform usage to enhance user experience.</li>
              </ul>

              <h5 className="text-gray-100 text-xl font-semibold mb-2">
                3. How We Share Your Information
              </h5>
              <p className="text-gray-300 mb-4">
                We do not sell your personal information. However, we may share your data with:
              </p>
              <ul className="text-gray-300 list-disc list-inside mb-4">
                <li><strong>Service Providers:</strong> Third-party partners who help operate our platform.</li>
                <li><strong>Legal Authorities:</strong> If required by law or to protect our platform’s security.</li>
              </ul>

              <h5 className="text-gray-100 text-xl font-semibold mb-2">
                4. Cookies and Tracking Technologies
              </h5>
              <p className="text-gray-300 mb-4">
                Watchly may use cookies and similar technologies to enhance functionality and collect usage analytics. You can control cookies through your browser settings.
              </p>

              <h5 className="text-gray-100 text-xl font-semibold mb-2">
                5. Data Security
              </h5>
              <p className="text-gray-300 mb-4">
                We implement reasonable security measures to protect your data. However, no online platform is completely secure, and we cannot guarantee absolute security.
              </p>

              <h5 className="text-gray-100 text-xl font-semibold mb-2">
                6. Your Rights
              </h5>
              <p className="text-gray-300 mb-4">
                Depending on your location, you may have the right to access, correct, or delete your personal information. Contact us at [your contact email] for such requests.
              </p>

              <h5 className="text-gray-100 text-xl font-semibold mb-2">
                7. Changes to This Policy
              </h5>
              <p className="text-gray-300 mb-4">
                We may update this Privacy Policy from time to time. Continued use of Watchly after changes constitutes acceptance of the updated Policy.
              </p>

              <h5 className="text-gray-100 text-xl font-semibold mb-2">
                8. Contact Us
              </h5>
              <p className="text-gray-300 mb-4">
                If you have any questions about this Privacy Policy, contact us at [your contact email].
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}