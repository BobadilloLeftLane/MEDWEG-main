export interface Translation {
  // Header
  header: {
    whyMedweg: string;
    howItWorks: string;
    about: string;
    contact: string;
    location: string;
    login: string;
  };

  // Hero Section
  hero: {
    subtitle: string;
    description: string;
  };

  // Why MedWeg Section
  whyMedweg: {
    title: string;
    subtitle: string;
    quality: {
      title: string;
      description: string;
    };
    delivery: {
      title: string;
      description: string;
    };
    certified: {
      title: string;
      description: string;
    };
    service: {
      title: string;
      description: string;
    };
    automation: {
      title: string;
      description: string;
    };
    statistics: {
      title: string;
      description: string;
    };
    staff: {
      title: string;
      description: string;
    };
    workflow: {
      title: string;
      description: string;
    };
    callToAction: {
      title: string;
      facilities: string;
      tagline: string;
    };
  };

  // How It Works Section
  howItWorks: {
    title: string;
    subtitle: string;
    steps: {
      registration: {
        label: string;
        description: string;
      };
      login: {
        label: string;
        description: string;
      };
      selectProducts: {
        label: string;
        description: string;
      };
      completeOrder: {
        label: string;
        description: string;
      };
    };
    detailedSteps: {
      registration: {
        title: string;
        step1: string;
        step2: string;
        step3: string;
        step4: string;
      };
      loginStaff: {
        title: string;
        step1: string;
        step2: string;
        step3: string;
        step4: string;
        step5: string;
      };
      products: {
        title: string;
        manualTitle: string;
        manualStep1: string;
        manualStep2: string;
        automatedTitle: string;
        automatedStep1: string;
        automatedStep2: string;
        automatedStep3: string;
      };
      orderControl: {
        title: string;
        step1: string;
        step2: string;
        step3: string;
        step4: string;
        step5: string;
      };
    };
    flexibility: {
      title: string;
      manual: {
        title: string;
        description: string;
      };
      automatic: {
        title: string;
        description: string;
      };
      staff: {
        title: string;
        description: string;
      };
    };
  };

  // About Us Section
  aboutUs: {
    title: string;
    description1: string;
    description2: string;
    products: {
      gloves: {
        title: string;
        description: string;
      };
      disinfectant: {
        title: string;
        description: string;
      };
      wipes: {
        title: string;
        description: string;
      };
    };
    ceo: {
      sectionTitle: string;
      name: string;
      position: string;
      experienceTitle: string;
      experienceText: string;
      companyTitle: string;
      companyDescription: string;
      closingText: string;
    };
  };

  // Partners Section
  partners: {
    title: string;
  };

  // Contact Section
  contact: {
    title: string;
    subtitle: string;
    form: {
      name: string;
      email: string;
      phone: string;
      message: string;
      submit: string;
      submitting: string;
      errors: {
        allFields: string;
        sendError: string;
      };
      success: string;
    };
  };

  // Location Section
  location: {
    title: string;
    companyName: string;
    city: string;
    details: {
      cityLabel: string;
      cityValue: string;
      emailLabel: string;
      phoneLabel: string;
      hoursLabel: string;
      hoursValue: string;
    };
  };

  // Footer
  footer: {
    description: string;
    quickLinks: string;
    products: string;
    about: string;
    contact: string;
    location: string;
    contactInfo: string;
    address: string;
    followUs: string;
    legal: string;
    privacyPolicy: string;
    termsOfService: string;
    imprint: string;
    copyright: string;
  };
}

export const translations: Record<'de' | 'en', Translation> = {
  de: {
    header: {
      whyMedweg: 'Warum MedWeg Bavaria',
      howItWorks: 'Wie funktioniert es?',
      about: 'Über uns',
      contact: 'Kontakt',
      location: 'Standort',
      login: 'Anmelden / Registrieren',
    },

    hero: {
      subtitle: 'BAVARIA',
      description: 'Ihr zuverlässiger Partner für hochwertige medizinische Einwegprodukte in ganz Deutschland',
    },

    whyMedweg: {
      title: 'Warum MedWeg Bavaria wählen?',
      subtitle: 'Modernste Technologie trifft auf jahrelange Erfahrung in der Pflegebranche',
      quality: {
        title: 'Höchste Qualität',
        description: 'Alle unsere Produkte erfüllen die strengsten medizinischen Standards und Qualitätsanforderungen. Geprüft und zertifiziert nach EU-Richtlinien.',
      },
      delivery: {
        title: 'Schnelle Lieferung',
        description: 'Zuverlässige und pünktliche Lieferung direkt zu Ihnen. Wir arbeiten mit renommierten Versandpartnern für maximale Sicherheit und Geschwindigkeit.',
      },
      certified: {
        title: 'Zertifizierte Produkte',
        description: 'Alle Produkte sind nach EU-Richtlinien zertifiziert und für den medizinischen Einsatz zugelassen. Qualität, der Sie vertrauen können.',
      },
      service: {
        title: 'Persönlicher Service',
        description: 'Unser kompetentes Team steht Ihnen bei Fragen jederzeit zur Verfügung. Individuelle Beratung für Ihre spezifischen Bedürfnisse.',
      },
      automation: {
        title: 'Automatisierte Plattform',
        description: 'Vollständig automatisierte Bestellabwicklung für Pflegedienste, Ambulante und Intensivpflege-Einrichtungen. Sparen Sie Zeit und reduzieren Sie Fehler durch intelligente Automatisierung.',
      },
      statistics: {
        title: 'Detaillierte Statistiken & Kontrolle',
        description: 'Behalten Sie den kompletten Überblick: Bestellhistorie, Ausgabenanalyse, Lagerbestände und Lieferstatistiken. Dashboard mit Echtzeitdaten für optimale Kontrolle Ihres Pflegedienstes.',
      },
      staff: {
        title: 'Mitarbeiterverwaltung',
        description: 'Verwalten Sie Benutzer und Mitarbeiter zentral. Weisen Sie Berechtigungen zu und behalten Sie die Kontrolle über alle Bestellaktivitäten in Ihrer Einrichtung.',
      },
      workflow: {
        title: 'Workflow-Kontrolle',
        description: 'Komplette Transparenz und Kontrolle des Bestellprozesses: Von der Anforderung über die Genehmigung bis zur Lieferung. Ideal für Intensivpflege und ambulante Dienste.',
      },
      callToAction: {
        title: 'Perfekt für Pflegeeinrichtungen',
        facilities: 'Pflegedienste • Ambulante Pflege • Intensivpflege • Kliniken',
        tagline: 'Entwickelt von Pflegeprofis für Pflegeprofis',
      },
    },

    howItWorks: {
      title: 'Wie funktioniert es?',
      subtitle: 'Einfach, schnell und benutzerfreundlich – So nutzen Sie unsere Plattform',
      steps: {
        registration: {
          label: 'Registrierung',
          description: 'Erstellen Sie Ihr Konto in wenigen Minuten',
        },
        login: {
          label: 'Anmeldung',
          description: 'Melden Sie sich sicher an',
        },
        selectProducts: {
          label: 'Produkte auswählen',
          description: 'Wählen Sie aus unserem Sortiment',
        },
        completeOrder: {
          label: 'Bestellung abschließen',
          description: 'Erhalten Sie Ihre Produkte schnell und zuverlässig',
        },
      },
      detailedSteps: {
        registration: {
          title: '1. Registrierung',
          step1: 'Klicken Sie auf "Anmelden / Registrieren"',
          step2: 'Füllen Sie das Registrierungsformular aus',
          step3: 'Bestätigen Sie Ihre E-Mail-Adresse',
          step4: 'Ihr Konto ist bereit!',
        },
        loginStaff: {
          title: '2. Anmeldung & Mitarbeiterverwaltung',
          step1: 'Geben Sie Ihre E-Mail und Passwort ein',
          step2: 'Zugriff auf Ihr persönliches Dashboard',
          step3: 'Erstellen Sie Mitarbeiterkonten',
          step4: 'Weisen Sie Berechtigungen zu',
          step5: 'Behalten Sie die Kontrolle über Ihr Profil',
        },
        products: {
          title: '3. Produkte auswählen – Manuell oder Automatisch',
          manualTitle: 'Manuell:',
          manualStep1: 'Durchsuchen Sie unser Produktsortiment',
          manualStep2: 'Bestellen Sie in nur wenigen Klicks',
          automatedTitle: 'Automatisiert:',
          automatedStep1: 'Richten Sie wiederkehrende Bestellungen ein',
          automatedStep2: 'Automatische monatliche Lieferungen',
          automatedStep3: 'Lassen Sie Mitarbeiter Bestellungen durchführen',
        },
        orderControl: {
          title: '4. Bestellung & Kontrolle',
          step1: 'Wählen Sie Lieferdatum und Versandart',
          step2: 'Bestätigen Sie Ihre Bestellung',
          step3: 'Verfolgen Sie den Status in Echtzeit',
          step4: 'Detaillierte Statistiken im Dashboard',
          step5: 'Kontrolle über den gesamten Workflow',
        },
      },
      flexibility: {
        title: 'Flexibilität für Ihren Pflegedienst',
        manual: {
          title: 'Manuelle Bestellung',
          description: 'Schnell und einfach in wenigen Klicks',
        },
        automatic: {
          title: 'Automatische Bestellung',
          description: 'Wiederkehrende monatliche Lieferungen',
        },
        staff: {
          title: 'Mitarbeiter-Bestellung',
          description: 'Delegieren Sie an Ihr Team',
        },
      },
    },

    aboutUs: {
      title: 'Über uns',
      description1: 'MedWeg Bavaria ist Ihr zuverlässiger Partner für medizinische Versorgung mit Sitz in Augsburg, Deutschland. Wir spezialisieren uns auf den Vertrieb hochwertiger medizinischer Produkte für Unternehmen und Privatpersonen.',
      description2: 'Unser Sortiment umfasst Einweghandschuhe, Desinfektionsmittel und Desinfektionstücher – alles, was Sie für eine sichere und hygienische Arbeitsumgebung benötigen.',
      products: {
        gloves: {
          title: 'Einweghandschuhe',
          description: 'Hochwertige Handschuhe in verschiedenen Größen (S, M, L, XL) für maximalen Schutz und Komfort in medizinischen und hygienischen Umgebungen.',
        },
        disinfectant: {
          title: 'Desinfektionsmittel',
          description: 'Effektive flüssige Desinfektionsmittel zur Hände- und Flächendesinfektion. Zuverlässiger Schutz gegen Bakterien und Viren.',
        },
        wipes: {
          title: 'Desinfektionstücher',
          description: 'Praktische Einwegtücher für schnelle und effektive Desinfektion von Oberflächen. Ideal für unterwegs und den täglichen Gebrauch.',
        },
      },
      ceo: {
        sectionTitle: 'Über den Geschäftsführer',
        name: 'Illes Papp',
        position: 'Geschäftsführer',
        experienceTitle: 'Erfahrung und Expertise',
        experienceText: 'Mit langjähriger Erfahrung in der Pflegebranche bringt Illes Papp umfassende Kenntnisse und praktische Expertise in die MedWeg Bavaria ein. Als erfahrener Geschäftsführer hat er erfolgreich sein eigenes Unternehmen in Deutschland geleitet:',
        companyTitle: 'Intensiv- und ambulante Pflegedienst',
        companyDescription: 'Gründung und Leitung eines erfolgreichen Pflegedienstes mit Fokus auf intensive und ambulante Pflege',
        closingText: 'Seine tiefe Branchenkenntnis und sein Engagement für Qualität machen ihn zum idealen Ansprechpartner für alle Fragen rund um medizinische Versorgungsprodukte. Bei MedWeg Bavaria steht Kundenservice, Zuverlässigkeit und höchste Qualitätsstandards an erster Stelle.',
      },
    },

    partners: {
      title: 'Unsere Partner',
    },

    contact: {
      title: 'Kontaktieren Sie uns',
      subtitle: 'Haben Sie Fragen oder möchten Sie ein Angebot erhalten? Schreiben Sie uns!',
      form: {
        name: 'Name *',
        email: 'E-Mail *',
        phone: 'Telefon',
        message: 'Ihre Nachricht *',
        submit: 'Nachricht senden',
        submitting: 'Wird gesendet...',
        errors: {
          allFields: 'Bitte füllen Sie alle Felder aus',
          sendError: 'Fehler beim Senden der Nachricht',
        },
        success: 'Vielen Dank! Ihre Nachricht wurde gesendet. Sie erhalten eine Bestätigungsmail.',
      },
    },

    location: {
      title: 'Unser Standort',
      companyName: 'MedWeg Bavaria',
      city: 'Augsburg, Deutschland',
      details: {
        cityLabel: 'Stadt:',
        cityValue: 'Augsburg, Bayern',
        emailLabel: 'E-Mail:',
        phoneLabel: 'Telefon:',
        hoursLabel: 'Öffnungszeiten:',
        hoursValue: 'Mo-Fr, 9:00-18:00 Uhr',
      },
    },

    footer: {
      description: 'Ihr zuverlässiger Partner für hochwertige medizinische Einwegprodukte in Deutschland.',
      quickLinks: 'Schnelllinks',
      products: 'Produkte',
      about: 'Über uns',
      contact: 'Kontakt',
      location: 'Standort',
      contactInfo: 'Kontakt',
      address: 'Augsburg, Bayern, Deutschland',
      followUs: 'Folgen Sie uns',
      legal: 'Rechtliches',
      privacyPolicy: 'Datenschutz',
      termsOfService: 'AGB',
      imprint: 'Impressum',
      copyright: 'Alle Rechte vorbehalten.',
    },
  },

  en: {
    header: {
      whyMedweg: 'Why MedWeg Bavaria',
      howItWorks: 'How It Works',
      about: 'About Us',
      contact: 'Contact',
      location: 'Location',
      login: 'Login / Register',
    },

    hero: {
      subtitle: 'BAVARIA',
      description: 'Your reliable partner for high-quality medical disposable products throughout Germany',
    },

    whyMedweg: {
      title: 'Why Choose MedWeg Bavaria?',
      subtitle: 'Cutting-edge technology meets years of experience in the healthcare industry',
      quality: {
        title: 'Highest Quality',
        description: 'All our products meet the strictest medical standards and quality requirements. Tested and certified according to EU guidelines.',
      },
      delivery: {
        title: 'Fast Delivery',
        description: 'Reliable and punctual delivery directly to you. We work with renowned shipping partners for maximum security and speed.',
      },
      certified: {
        title: 'Certified Products',
        description: 'All products are certified according to EU guidelines and approved for medical use. Quality you can trust.',
      },
      service: {
        title: 'Personal Service',
        description: 'Our competent team is available to answer your questions at any time. Individual consultation for your specific needs.',
      },
      automation: {
        title: 'Automated Platform',
        description: 'Fully automated order processing for nursing services, outpatient and intensive care facilities. Save time and reduce errors through intelligent automation.',
      },
      statistics: {
        title: 'Detailed Statistics & Control',
        description: 'Keep complete overview: order history, expense analysis, inventory levels and delivery statistics. Dashboard with real-time data for optimal control of your nursing service.',
      },
      staff: {
        title: 'Staff Management',
        description: 'Manage users and employees centrally. Assign permissions and maintain control over all ordering activities in your facility.',
      },
      workflow: {
        title: 'Workflow Control',
        description: 'Complete transparency and control of the ordering process: From request through approval to delivery. Ideal for intensive care and outpatient services.',
      },
      callToAction: {
        title: 'Perfect for Healthcare Facilities',
        facilities: 'Nursing Services • Outpatient Care • Intensive Care • Clinics',
        tagline: 'Developed by care professionals for care professionals',
      },
    },

    howItWorks: {
      title: 'How Does It Work?',
      subtitle: 'Simple, fast and user-friendly – How to use our platform',
      steps: {
        registration: {
          label: 'Registration',
          description: 'Create your account in just a few minutes',
        },
        login: {
          label: 'Login',
          description: 'Sign in securely',
        },
        selectProducts: {
          label: 'Select Products',
          description: 'Choose from our range',
        },
        completeOrder: {
          label: 'Complete Order',
          description: 'Receive your products quickly and reliably',
        },
      },
      detailedSteps: {
        registration: {
          title: '1. Registration',
          step1: 'Click on "Login / Register"',
          step2: 'Fill out the registration form',
          step3: 'Confirm your email address',
          step4: 'Your account is ready!',
        },
        loginStaff: {
          title: '2. Login & Staff Management',
          step1: 'Enter your email and password',
          step2: 'Access your personal dashboard',
          step3: 'Create employee accounts',
          step4: 'Assign permissions',
          step5: 'Maintain control over your profile',
        },
        products: {
          title: '3. Select Products – Manual or Automatic',
          manualTitle: 'Manual:',
          manualStep1: 'Browse our product range',
          manualStep2: 'Order in just a few clicks',
          automatedTitle: 'Automated:',
          automatedStep1: 'Set up recurring orders',
          automatedStep2: 'Automatic monthly deliveries',
          automatedStep3: 'Let employees place orders',
        },
        orderControl: {
          title: '4. Order & Control',
          step1: 'Select delivery date and shipping method',
          step2: 'Confirm your order',
          step3: 'Track status in real-time',
          step4: 'Detailed statistics in dashboard',
          step5: 'Control over the entire workflow',
        },
      },
      flexibility: {
        title: 'Flexibility for Your Care Service',
        manual: {
          title: 'Manual Order',
          description: 'Quick and easy in just a few clicks',
        },
        automatic: {
          title: 'Automatic Order',
          description: 'Recurring monthly deliveries',
        },
        staff: {
          title: 'Staff Order',
          description: 'Delegate to your team',
        },
      },
    },

    aboutUs: {
      title: 'About Us',
      description1: 'MedWeg Bavaria is your reliable partner for medical supplies based in Augsburg, Germany. We specialize in the distribution of high-quality medical products for businesses and individuals.',
      description2: 'Our range includes disposable gloves, disinfectants and disinfectant wipes – everything you need for a safe and hygienic work environment.',
      products: {
        gloves: {
          title: 'Disposable Gloves',
          description: 'High-quality gloves in various sizes (S, M, L, XL) for maximum protection and comfort in medical and hygienic environments.',
        },
        disinfectant: {
          title: 'Disinfectants',
          description: 'Effective liquid disinfectants for hand and surface disinfection. Reliable protection against bacteria and viruses.',
        },
        wipes: {
          title: 'Disinfectant Wipes',
          description: 'Practical disposable wipes for quick and effective disinfection of surfaces. Ideal for on-the-go and daily use.',
        },
      },
      ceo: {
        sectionTitle: 'About the CEO',
        name: 'Illes Papp',
        position: 'Chief Executive Officer',
        experienceTitle: 'Experience and Expertise',
        experienceText: 'With years of experience in the healthcare industry, Illes Papp brings comprehensive knowledge and practical expertise to MedWeg Bavaria. As an experienced CEO, he has successfully led his own company in Germany:',
        companyTitle: 'Intensive and Outpatient Care Service',
        companyDescription: 'Founding and management of a successful care service with focus on intensive and outpatient care',
        closingText: 'His deep industry knowledge and commitment to quality make him the ideal contact for all questions regarding medical supply products. At MedWeg Bavaria, customer service, reliability and the highest quality standards come first.',
      },
    },

    partners: {
      title: 'Our Partners',
    },

    contact: {
      title: 'Contact Us',
      subtitle: 'Do you have questions or would you like to receive a quote? Write to us!',
      form: {
        name: 'Name *',
        email: 'Email *',
        phone: 'Phone',
        message: 'Your Message *',
        submit: 'Send Message',
        submitting: 'Sending...',
        errors: {
          allFields: 'Please fill in all fields',
          sendError: 'Error sending message',
        },
        success: 'Thank you! Your message has been sent. You will receive a confirmation email.',
      },
    },

    location: {
      title: 'Our Location',
      companyName: 'MedWeg Bavaria',
      city: 'Augsburg, Germany',
      details: {
        cityLabel: 'City:',
        cityValue: 'Augsburg, Bavaria',
        emailLabel: 'Email:',
        phoneLabel: 'Phone:',
        hoursLabel: 'Opening Hours:',
        hoursValue: 'Mon-Fri, 9:00 AM - 6:00 PM',
      },
    },

    footer: {
      description: 'Your reliable partner for high-quality medical disposable products in Germany.',
      quickLinks: 'Quick Links',
      products: 'Products',
      about: 'About Us',
      contact: 'Contact',
      location: 'Location',
      contactInfo: 'Contact',
      address: 'Augsburg, Bavaria, Germany',
      followUs: 'Follow Us',
      legal: 'Legal',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      imprint: 'Imprint',
      copyright: 'All rights reserved.',
    },
  },
};
