import { useState } from 'react';
import { X, Download, ShieldCheck, FileText } from 'lucide-react';
import { useAppContext } from "@/context/AppContext";
import { translations } from "@/constants/translations";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet as PDFStyleSheet,
  PDFDownloadLink
} from '@react-pdf/renderer';

// PDF Styles
const pdfStyles = PDFStyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.6,
    color: '#1E1E1E',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D9',
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#0D7377',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 8,
    color: '#737373',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0D7377',
    marginBottom: 6,
    marginTop: 8,
  },
  paragraph: {
    marginBottom: 6,
    textAlign: 'justify',
  },
  listItem: {
    marginLeft: 15,
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#D9D9D9',
    paddingTop: 10,
    fontSize: 7,
    color: '#737373',
    textAlign: 'center',
  }
});

// PDF Document for Terms of Use — receives translated content
const TermosPDF = ({ c }: { c: any }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.title}>{c.docTitle}</Text>
        <Text style={pdfStyles.subtitle}>{c.docSubtitle}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>{c.s1title}</Text>
        <Text style={pdfStyles.paragraph}>{c.s1body}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>{c.s2title}</Text>
        <Text style={pdfStyles.paragraph}>{c.s2intro}</Text>
        <Text style={pdfStyles.listItem}>• {c.s2li1}</Text>
        <Text style={pdfStyles.listItem}>• {c.s2li2}</Text>
        <Text style={pdfStyles.listItem}>• {c.s2li3}</Text>
        <Text style={pdfStyles.listItem}>• {c.s2li4}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>{c.s3title}</Text>
        <Text style={pdfStyles.paragraph}>{c.s3body}</Text>
        <Text style={pdfStyles.paragraph}>{c.s3accountTypes}</Text>
        <Text style={pdfStyles.listItem}>• {c.s3li1}</Text>
        <Text style={pdfStyles.listItem}>• {c.s3li2}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>{c.s4title}</Text>
        <Text style={pdfStyles.paragraph}>{c.s4body}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>{c.s5title}</Text>
        <Text style={pdfStyles.paragraph}>{c.s5body}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>{c.s6title}</Text>
        <Text style={pdfStyles.paragraph}>{c.s6body}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>{c.s7title}</Text>
        <Text style={pdfStyles.paragraph}>{c.s7body}</Text>
      </View>

      <Text style={pdfStyles.footer} render={({ pageNumber, totalPages }) =>
        c.pdfFooter.replace('{page}', String(pageNumber)).replace('{total}', String(totalPages))
      } />
    </Page>
  </Document>
);

// PDF Document for Privacy Policy — receives translated content
const PrivacidadePDF = ({ c }: { c: any }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.title}>{c.docTitle}</Text>
        <Text style={pdfStyles.subtitle}>{c.docSubtitle}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>{c.s1title}</Text>
        <Text style={pdfStyles.paragraph}>{c.s1body}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>{c.s2title}</Text>
        <Text style={pdfStyles.paragraph}>{c.s2intro}</Text>
        <Text style={pdfStyles.listItem}>• {c.s2li1}</Text>
        <Text style={pdfStyles.listItem}>• {c.s2li2}</Text>
        <Text style={pdfStyles.listItem}>• {c.s2li3}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>{c.s3title}</Text>
        <Text style={pdfStyles.paragraph}>{c.s3intro}</Text>
        <Text style={pdfStyles.listItem}>• {c.s3li1label} {c.s3li1}</Text>
        <Text style={pdfStyles.listItem}>• {c.s3li2label} {c.s3li2}</Text>
        <Text style={pdfStyles.listItem}>• {c.s3li3label} {c.s3li3}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>{c.s4title}</Text>
        <Text style={pdfStyles.paragraph}>{c.s4intro}</Text>
        <Text style={pdfStyles.listItem}>• {c.s4li1label} {c.s4li1}</Text>
        <Text style={pdfStyles.listItem}>• {c.s4li2label} {c.s4li2}</Text>
        <Text style={pdfStyles.listItem}>• {c.s4li3label} {c.s4li3}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>{c.s5title}</Text>
        <Text style={pdfStyles.paragraph}>{c.s5intro}</Text>
        <Text style={pdfStyles.listItem}>• {c.s5li1}</Text>
        <Text style={pdfStyles.listItem}>• {c.s5li2label} {c.s5li2}</Text>
        <Text style={pdfStyles.listItem}>• {c.s5li3}</Text>
        <Text style={pdfStyles.listItem}>• {c.s5li4label} {c.s5li4}</Text>
        <Text style={pdfStyles.listItem}>• {c.s5li5label} {c.s5li5}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>{c.s6title}</Text>
        <Text style={pdfStyles.paragraph}>{c.s6body1}</Text>
        <Text style={pdfStyles.paragraph}>{c.s6body2}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>{c.s7title}</Text>
        <Text style={pdfStyles.paragraph}>{c.s7body} dpo@sergipanidade.gov.br</Text>
      </View>

      <Text style={pdfStyles.footer} render={({ pageNumber, totalPages }) =>
        c.pdfFooter.replace('{page}', String(pageNumber)).replace('{total}', String(totalPages))
      } />
    </Page>
  </Document>
);

interface DocumentosModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'termos' | 'privacidade';
}

export function DocumentosModal({ isOpen, onClose, defaultTab = 'termos' }: DocumentosModalProps) {
  const { language } = useAppContext();
  const cleanLanguage = language === 'sp' ? 'pt' : language;
  const t = translations[cleanLanguage];
  const lc = (t as any).legalContent;
  const tc = lc.termos;
  const pc = lc.privacidade;
  const [activeTab, setActiveTab] = useState<'termos' | 'privacidade'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-9999 p-4 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-[#D9D9D9] relative animate-[scaleIn_0.25s_cubic-bezier(0.34,1.56,0.64,1)]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#F7F6F3] border-b border-[#D9D9D9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeTab === 'termos' ? (
              <FileText className="text-[#0D7377] w-6 h-6" />
            ) : (
              <ShieldCheck className="text-[#0D7377] w-6 h-6" />
            )}
            <div>
              <h2 className="font-semibold font-display text-xl text-[#1E1E1E] uppercase tracking-tight">
                {t.legalDocuments}
              </h2>
              <p className="text-xs text-[#737373]">
                {t.legalSubtitle}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 text-[#737373] hover:text-[#1E1E1E] hover:bg-black/5 rounded-full transition-all border-none bg-transparent cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#D9D9D9] px-6 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('termos')}
            className={`px-5 py-3.5 border-none bg-transparent cursor-pointer font-semibold text-sm transition-all relative ${
              activeTab === 'termos' ? 'text-[#0D7377]' : 'text-[#737373] hover:text-[#1E1E1E]'
            }`}
          >
            {t.termsOfUse}
            {activeTab === 'termos' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0D7377] rounded-t-full" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('privacidade')}
            className={`px-5 py-3.5 border-none bg-transparent cursor-pointer font-semibold text-sm transition-all relative ${
              activeTab === 'privacidade' ? 'text-[#0D7377]' : 'text-[#737373] hover:text-[#1E1E1E]'
            }`}
          >
            {t.privacyPolicy}
            {activeTab === 'privacidade' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0D7377] rounded-t-full" />
            )}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 bg-white">
          {activeTab === 'termos' ? (
            <div className="space-y-6 text-[#1E1E1E] leading-relaxed text-sm">
              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">{tc.s1title}</h3>
                <p>{tc.s1body}</p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">{tc.s2title}</h3>
                <p className="mb-2">{tc.s2intro}</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>{tc.s2li1}</li>
                  <li>{tc.s2li2}</li>
                  <li>{tc.s2li3}</li>
                  <li>{tc.s2li4}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">{tc.s3title}</h3>
                <p className="mb-2">{tc.s3body}</p>
                <p className="font-semibold text-xs text-[#737373]">{tc.s3accountTypes}</p>
                <ul className="list-disc pl-5 space-y-1 mt-1 text-xs text-[#737373]">
                  <li>{tc.s3li1}</li>
                  <li>{tc.s3li2}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">{tc.s4title}</h3>
                <p>{tc.s4body}</p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">{tc.s5title}</h3>
                <p>{tc.s5body}</p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">{tc.s6title}</h3>
                <p>{tc.s6body}</p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">{tc.s7title}</h3>
                <p>{tc.s7body}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-[#1E1E1E] leading-relaxed text-sm">
              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">{pc.s1title}</h3>
                <p>{pc.s1body}</p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">{pc.s2title}</h3>
                <p className="mb-2">{pc.s2intro}</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>{pc.s2li1.split(':')[0]}:</strong>{pc.s2li1.includes(':') ? pc.s2li1.substring(pc.s2li1.indexOf(':') + 1) : ''}</li>
                  <li><strong>{pc.s2li2.split(':')[0]}:</strong>{pc.s2li2.includes(':') ? pc.s2li2.substring(pc.s2li2.indexOf(':') + 1) : ''}</li>
                  <li><strong>{pc.s2li3.split(':')[0]}:</strong>{pc.s2li3.includes(':') ? pc.s2li3.substring(pc.s2li3.indexOf(':') + 1) : ''}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">{pc.s3title}</h3>
                <p className="mb-2">{pc.s3intro}</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>{pc.s3li1label}</strong> {pc.s3li1}</li>
                  <li><strong>{pc.s3li2label}</strong> {pc.s3li2}</li>
                  <li><strong>{pc.s3li3label}</strong> {pc.s3li3}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">{pc.s4title}</h3>
                <p className="mb-2">{pc.s4intro}</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>{pc.s4li1label}</strong> {pc.s4li1}</li>
                  <li><strong>{pc.s4li2label}</strong> {pc.s4li2}</li>
                  <li><strong>{pc.s4li3label}</strong> {pc.s4li3}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">{pc.s5title}</h3>
                <p className="mb-2">{pc.s5intro}</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>{pc.s5li1}</li>
                  <li><strong>{pc.s5li2label}</strong> {pc.s5li2}</li>
                  <li>{pc.s5li3}</li>
                  <li><strong>{pc.s5li4label}</strong> {pc.s5li4}</li>
                  <li><strong>{pc.s5li5label}</strong> {pc.s5li5}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">{pc.s6title}</h3>
                <p className="mb-2">{pc.s6body1}</p>
                <p>{pc.s6body2}</p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">{pc.s7title}</h3>
                <p>
                  {pc.s7body}{' '}
                  <a href="mailto:dpo@sergipanidade.gov.br" className="text-[#0D7377] hover:underline">
                    dpo@sergipanidade.gov.br
                  </a>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with PDF Download options */}
        <div className="px-6 py-4 bg-[#F7F6F3] border-t border-[#D9D9D9] flex items-center justify-between shrink-0">
          <p className="text-xs text-[#737373]">
            {t.legalFooter}
          </p>

          <div className="flex gap-3">
            {activeTab === 'termos' ? (
              <PDFDownloadLink
                document={<TermosPDF c={tc} />}
                fileName={`sergipanidade-terms-${cleanLanguage}.pdf`}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0D7377] hover:bg-[#0a5d61] text-white font-semibold text-xs rounded-lg shadow-md transition-all border-none cursor-pointer text-center no-underline"
              >
                {({ loading }) => (
                  <>
                    <Download size={14} />
                    <span>{loading ? t.preparingPDF : t.downloadTerms}</span>
                  </>
                )}
              </PDFDownloadLink>
            ) : (
              <PDFDownloadLink
                document={<PrivacidadePDF c={pc} />}
                fileName={`sergipanidade-privacy-${cleanLanguage}.pdf`}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0D7377] hover:bg-[#0a5d61] text-white font-semibold text-xs rounded-lg shadow-md transition-all border-none cursor-pointer text-center no-underline"
              >
                {({ loading }) => (
                  <>
                    <Download size={14} />
                    <span>{loading ? t.preparingPDF : t.downloadPrivacy}</span>
                  </>
                )}
              </PDFDownloadLink>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-white text-[#1E1E1E] hover:bg-black/5 font-semibold text-xs rounded-lg border border-[#D9D9D9] transition-all cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
