
import React from 'react';
import Card from '../components/Card';
import { useTranslation } from '../hooks/useTranslation';

const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto max-w-4xl font-fredoka">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-brand-blue-dark dark:text-brand-blue-light">{t('privacyTitle')}</h1>

      <Card className="p-8 bg-white dark:bg-gray-800 prose dark:prose-invert max-w-none">
        <p><em>{t('lastUpdated', { date: new Date().toLocaleDateString() })}</em></p>

        <h2>1. Introduction</h2>
        <p>
          Welcome to <strong>FeVeDucation</strong>. We respect your privacy and are committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit our website and our practices for collecting, using, maintaining, protecting, and disclosing that information.
        </p>
        <p dangerouslySetInnerHTML={{ __html: t('privacyP1') }} />

        <h2>2. Information We Collect</h2>
        <p>We collect several types of information from and about users of our Website, including information:</p>
        <ul>
            <li>
                <strong>Personal Information:</strong> by which you may be personally identified, such as name, postal address, e-mail address, telephone number, or any other identifier by which you may be contacted online or offline ("personal information").
            </li>
            <li>
                <strong>Usage Details:</strong> about your internet connection, the equipment you use to access our Website, and usage details.
            </li>
        </ul>
        
        <h2>3. How We Use Your Information</h2>
        <p>We use information that we collect about you or that you provide to us, including any personal information:</p>
        <ul>
            <li>To present our Website and its contents to you.</li>
            <li>To provide you with information, products, or services that you request from us.</li>
            <li>To fulfill any other purpose for which you provide it.</li>
            <li>To carry out our obligations and enforce our rights arising from any contracts entered into between you and us, including for billing and collection.</li>
        </ul>
        
        <h2>4. Data Security</h2>
        <p>
          We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. The safety and security of your information also depends on you. Where we have given you (or where you have chosen) a password for access to certain parts of our Website, you are responsible for keeping this password confidential.
        </p>

        <h2>5. Changes to Our Privacy Policy</h2>
        <p>
          It is our policy to post any changes we make to our privacy policy on this page. If we make material changes to how we treat our users' personal information, we will notify you through a notice on the Website home page.
        </p>

        <h2>6. Contact Information</h2>
        <p>
          To ask questions or comment about this privacy policy and our privacy practices, contact us at: <strong>privacy@feveducation.com</strong>.
        </p>
      </Card>
    </div>
  );
};

export default PrivacyPage;
