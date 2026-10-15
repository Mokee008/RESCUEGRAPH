export interface TranslationSchema {
  nav: {
    hero: string;
    flood: string;
    damage: string;
    cutoff: string;
    path: string;
    report: string;
    validation: string;
  };
  actions: {
    runAnalysis: string;
    loadCaseStudy: string;
    flyTo: string;
    inspect: string;
    prev: string;
    next: string;
    liteMode: string;
    classicView: string;
  };
  stats: {
    confirmedBridges: string;
    cutOffSettlements: string;
    debrisCandidates: string;
    syncRate: string;
  };
  subtitles: {
    s0: string;
    s1: string;
    s2: string;
    s3: string;
    s4: string;
    s5: string;
    s6: string;
  };
}

export const translations: Record<'en' | 'ne', TranslationSchema> = {
  en: {
    nav: {
      hero: 'Mission Control',
      flood: 'Flood S1',
      damage: 'Damage S2',
      cutoff: 'Cut-off S3',
      path: 'Surge Path S4',
      report: 'Report SITREP',
      validation: 'Validation S6',
    },
    actions: {
      runAnalysis: 'Run Analysis',
      loadCaseStudy: 'Load Trishuli Case Study',
      flyTo: 'Fly Camera to Feature',
      inspect: 'Inspect Layer Evidence',
      prev: '← Prev',
      next: 'Next →',
      liteMode: 'Lite Mode',
      classicView: 'Classic Console',
    },
    stats: {
      confirmedBridges: 'Bridge Failures',
      cutOffSettlements: 'Cut-off Settlements',
      debrisCandidates: 'Debris Candidates',
      syncRate: 'Sentinel-1 Orbit Sync',
    },
    subtitles: {
      s0: 'SPACEBORNE SAR & OPTICAL FLOOD DAMAGE MAPPING · AUGUST 2026 TRISHULI FLOOD',
      s1: 'INTERFEROMETRIC COHERENCE LOSS + OPTICAL WATER MASK (TRISHULI BASIN)',
      s2: 'STATISTICAL BREAKDOWN BY UNCERTAINTY STATUS & INTERACTIVE ASSET FLIGHT',
      s3: 'TOPOLOGICAL GRAPH CUT IDENTIFYING HIGHLAND ISOLATION & HOSPITAL ACCESS',
      s4: 'TOPOGRAPHIC D8 FLOW DIRECTION & SURGE PROPAGATION TIME TO IMPACT',
      s5: 'ZERO-HALLUCINATION DISASTER INTELLIGENCE BRIEF · ENGLISH & NEPALI',
      s6: 'AIR-GAPPED BENCHMARK AGAINST COPERNICUS EMERGENCY MANAGEMENT SERVICE (EMSR927)',
    },
  },
  ne: {
    nav: {
      hero: 'अभियान नियन्त्रण',
      flood: 'बाढी राडार',
      damage: 'संरचनात्मक क्षति',
      cutoff: 'विच्छेद बस्ती',
      path: 'बहाव मार्ग',
      report: 'स्थिति प्रतिवेदन',
      validation: 'प्रमाणीकरण',
    },
    actions: {
      runAnalysis: 'विश्लेषण चलाउनुहोस्',
      loadCaseStudy: 'त्रिशूली घटना अध्ययन',
      flyTo: 'क्यामेरा केन्द्रित गर्नुहोस्',
      inspect: 'प्रमाण जाँच गर्नुहोस्',
      prev: '← अघिल्लो',
      next: 'पछिल्लो →',
      liteMode: 'लाइट मोड',
      classicView: 'क्लासिक दृश्य',
    },
    stats: {
      confirmedBridges: 'क्षतिग्रस्त पुलहरू',
      cutOffSettlements: 'विच्छेद भएका बस्तीहरू',
      debrisCandidates: 'लेदो सम्भावित क्षेत्र',
      syncRate: 'सेन्टिनेल-१ कक्षीय सिङ्क',
    },
    subtitles: {
      s0: 'अन्तरिक्ष राडार तथा अप्टिकल बाढी क्षति नक्साङ्कन · अगस्ट २०२६ त्रिशूली',
      s1: 'इन्टरफेरोमेट्रिक कोहेरेन्स ह्रास तथा पानीको फैलावट (त्रिशूली जलाधार)',
      s2: 'अनिश्चितता स्थिति अनुसारको तथ्याङ्क तथा अन्तरक्रियात्मक संरचना अवलोकन',
      s3: 'टोपोलोजिकल ग्राफ कटद्वारा पहिचान गरिएका विच्छेद बस्ती तथा अस्पताल पहुँच',
      s4: 'D8 भू-सतह बहाव दिशा तथा बस्तीहरूमा बाढी पुग्ने अनुमानित समय',
      s5: 'शून्य-भ्रम विपद् गुप्तचर विवरण · नेपाली तथा अङ्ग्रेजी',
      s6: 'कोपरनिकस आपत्कालीन व्यवस्थापन सेवा (EMSR927) विरुद्ध स्वतन्त्र प्रमाणीकरण',
    },
  },
};
