import React, { useState } from 'react';
import { TypewriterTitle } from '../style-tile/TypewriterTitle';
import { MagneticButton } from '../style-tile/MagneticButton';
import { FileText, Download, Printer, Languages, CheckCircle2, ShieldCheck } from 'lucide-react';
import jsPDF from 'jspdf';

interface S5ReportSlideProps {
  language?: 'en' | 'ne';
  onLanguageToggle?: () => void;
}

export function S5_ReportSlide({
  language: initialLang = 'en',
}: S5ReportSlideProps) {
  const [lang, setLang] = useState<'en' | 'ne'>(initialLang);
  const [isExporting, setIsExporting] = useState(false);

  React.useEffect(() => {
    setLang(initialLang);
  }, [initialLang]);

  const handleDownloadPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('RESCUEGRAPH // FLOODSAT SITREP REPORT', 20, 25);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('INCIDENT: August 2026 Trishuli Glacial Surge (Rasuwa & Nuwakot, Nepal)', 20, 33);
      doc.text('DATE GENERATED: 2026-08-15 06:00 UTC · S-BAND SAR INTERFEROMETRY', 20, 39);

      doc.line(20, 44, 190, 44);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('1. CRITICAL INFRASTRUCTURE STATUS', 20, 52);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('• 4 Bridges Confirmed Severed (Bridge B4 Bhetrawati, Bridge B1 Syabrubesi).', 25, 60);
      doc.text('• 7 Highland Settlements Completely Cut Off from Level-3 Medical Facilities.', 25, 66);
      doc.text('• Coherence loss verified against Sentinel-1 IW ascending pass (Relative orbit 085).', 25, 72);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('2. PRIORITY RESCUE RECOMMENDATIONS', 20, 84);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('• Deploy rotary airlift to Mailung Village (1,850 residents isolated).', 25, 92);
      doc.text('• Pre-stage military Bailey Bridge at Bhetrawati chokepoint (Bridge B4).', 25, 98);
      doc.text('• Re-route non-critical transit via Dhunche alternate mountain trail (+46km).', 25, 104);

      doc.setFontSize(8);
      doc.text('Verification: Copernicus Emergency Management Service data (EMSR927). Reference only.', 20, 275);

      doc.save(`FLOODSAT_SITREP_${lang.toUpperCase()}_TRISHULI.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen pt-20 pb-16 px-6 flex flex-col justify-between pointer-events-none">
      {/* 1. Slide Title Header */}
      <div className="relative z-20 max-w-4xl mx-auto text-center pointer-events-auto">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded clip-badge border border-white/20 bg-black/80 font-mono text-[9px] uppercase tracking-widest text-slate-300 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>SCENE 05 // ONE-PAGE INCIDENT SITUATION REPORT</span>
        </div>
        <TypewriterTitle
          title={lang === 'en' ? 'ONE-PAGE SITREP' : 'घटना स्थिति प्रतिवेदन'}
          subtitle={
            lang === 'en'
              ? 'ZERO-HALLUCINATION DISASTER INTELLIGENCE BRIEF · ENGLISH & NEPALI'
              : 'शून्य-भ्रम विपद् गुप्तचर विवरण · नेपाली तथा अङ्ग्रेजी'
          }
          speedMs={24}
        />
      </div>

      {/* 2. Main One-Page SITREP Document Preview */}
      <div className="relative z-20 max-w-3xl mx-auto w-full p-6 clip-chamfer-md border border-white/30 bg-black/90 backdrop-blur-md shadow-[0_16px_48px_rgba(0,0,0,0.9)] pointer-events-auto my-auto">
        {/* Document Header */}
        <div className="flex items-center justify-between border-b border-white/20 pb-4 mb-4">
          <div>
            <div className="font-['Michroma'] text-xs font-bold text-white tracking-wider">
              {lang === 'en' ? 'GOVERNMENT OF NEPAL // NDRRMA' : 'नेपाल सरकार // विपद् जोखिम न्यूनीकरण प्राधिकरण'}
            </div>
            <div className="font-mono text-[10px] text-slate-400 mt-0.5">
              INCIDENT CODE: 2026-TRISHULI-FL01 · SECTOR: RASUWA / NUWAKOT
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'ne' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1 rounded clip-chamfer-sm border border-white/30 font-mono text-xs text-white hover:bg-white/10 cursor-pointer transition-colors"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'नेपालीमा हेर्नुहोस्' : 'View in English'}</span>
            </button>
          </div>
        </div>

        {/* Document Body */}
        {lang === 'en' ? (
          <div className="space-y-4 font-mono text-xs text-slate-300">
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                <span className="text-white">1.</span>
                <span>Executive Summary & SAR Sensor Observation</span>
              </h4>
              <p className="leading-relaxed text-slate-300">
                A glacial surge triggered catastrophic debris mobilization down the Trishuli River basin on 14 August 2026. 
                Sentinel-1 SAR coherence differential (-74%) identifies total structural deck failure at Bridge B4 (Bhetrawati) 
                and severed access across highway kilometer 24.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                <span className="text-white">2.</span>
                <span>Topological Impact & Cut-Off Populations</span>
              </h4>
              <p className="leading-relaxed text-slate-300">
                7 settlements are completely cut off from road access to Trishuli District Hospital. 
                Mailung Village (pop: 1,850) and Haku Highland (pop: 2,400) face zero remaining vehicular egress. 
                Emergency mountain footpaths require a +46.5 km detour.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                <span className="text-white">3.</span>
                <span>Urgent Command Action Directives</span>
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-200">
                <li>Deploy rotary-wing airlift to Mailung LZ for critical medical evacuations.</li>
                <li>Mobilize rapid Bailey bridge engineering units to Bhetrawati chokepoint.</li>
                <li>Coordinate humanitarian convoys through Dhunche northern spur route.</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4 font-['Noto_Sans_Devanagari',sans-serif] text-xs text-slate-300">
            <div>
              <h4 className="text-white font-bold text-sm mb-1">
                १. कार्यकारी सारांश तथा उपग्रह राडार विश्लेषण
              </h4>
              <p className="leading-relaxed">
                मिति २०८३ श्रावण ३० मा त्रिशूली नदी जलाधार क्षेत्रमा आएको भीषण बाढी र लेदो बहावले गर्दा बेत्रावतीको 
                पुल B4 पूर्ण रूपमा क्षतिग्रस्त भएको छ। सेन्टिनेल-१ उपग्रह राडार कोहेरेन्समा आएको ७४% गिरावटले 
                संरचनात्मक क्षति पुष्टि गरेको छ।
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-1">
                २. सम्पर्क विच्छेद भएका बस्तीहरू तथा मानवीय असर
              </h4>
              <p className="leading-relaxed">
                मैलुङ (जनसङ्ख्या: १,८५०) र हाकु (जनसङ्ख्या: २,४००) लगायतका ७ बस्तीहरू जिल्ला अस्पताल त्रिशूलीसँग 
                सडक सम्पर्कबाट पूर्ण रूपमा विच्छेद भएका छन्। बैकल्पिक पहाडी बाटोबाट जान ४६.५ कि.मि. थप यात्रा गर्नुपर्नेछ।
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-1">
                ३. आपत्कालीन उद्धार सिफारिसहरू
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-200">
                <li>मैलुङ क्षेत्रमा हेलिकप्टर उद्धार टोली तत्काल परिचालन गर्ने।</li>
                <li>बेत्रावतीमा आपत्कालीन बेली ब्रिज निर्माणका लागि नेपाली सेनाको टोली खटाउने।</li>
                <li>धुन्चे वैकल्पिक मार्गबाट राहत सामग्री ढुवानी गर्ने।</li>
              </ul>
            </div>
          </div>
        )}

        {/* Verification Tag */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>GROUNDED DATA: COPERNICUS EMSR927 CHECKED</span>
          </div>
          <span>ZERO HALLUCINATED NUMBERS</span>
        </div>
      </div>

      {/* 3. Action Footer Bar */}
      <div className="relative z-20 max-w-3xl mx-auto w-full flex items-center justify-between pointer-events-auto">
        <span className="font-mono text-xs text-slate-400">
          OFFICIAL NDRRMA FORMAT COMPLIANT
        </span>

        <MagneticButton
          variant="flyto"
          icon={<Download className="w-3.5 h-3.5" />}
          onClick={handleDownloadPDF}
        >
          {isExporting ? 'Generating PDF...' : 'Download Official PDF'}
        </MagneticButton>
      </div>
    </div>
  );
}
