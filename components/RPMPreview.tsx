import React, { useRef } from 'react';
import { RPMResult } from '../types';
import { Copy, Download, ArrowLeft } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface RPMPreviewProps {
  data: RPMResult;
  onReset: () => void;
}

const RPMPreview: React.FC<RPMPreviewProps> = ({ data, onReset }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleCopyToDocs = async () => {
    if (!contentRef.current) return;
    
    try {
      const blob = new Blob([contentRef.current.innerHTML], { type: 'text/html' });
      // @ts-ignore
      const clipboardItem = new ClipboardItem({ 'text/html': blob });
      // @ts-ignore
      await navigator.clipboard.write([clipboardItem]);
      
      const confirm = window.confirm("Konten RPM telah disalin ke Clipboard! \n\nSekarang kami akan membuka Google Docs baru. \nSilakan tekan 'Ctrl+V' (Paste) di halaman Google Docs yang terbuka untuk melihat hasilnya.");
      
      if(confirm) {
        window.open('https://docs.google.com/document/create', '_blank');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menyalin otomatis. Silakan seleksi manual dan salin.');
    }
  };

  const handleDownloadPDF = () => {
    const element = contentRef.current;
    
    // Konfigurasi Margin: 1cm (10mm) untuk semua sisi
    const opt = {
      margin:       10, 
      filename:     `RPM_${data.subject}_Kelas${data.classLevel}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true }, 
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    // Generate PDF dengan Footer Custom
    html2pdf()
      .from(element)
      .set(opt)
      .toPdf()
      .get('pdf')
      .then((pdf: any) => {
        const totalPages = pdf.internal.getNumberOfPages();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.setTextColor(0, 0, 0); // Strictly Black
          
          // Text Footer Kiri: Informasi Dokumen
          const leftText = `RPM Kelas ${data.classLevel} | ${data.subject}`;
          pdf.text(leftText, 10, pageHeight - 5); 

          // Text Footer Kanan: Nomor Halaman
          const rightText = `Hal. ${i} dari ${totalPages}`;
          const textWidth = pdf.getStringUnitWidth(rightText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
          pdf.text(rightText, pageWidth - 10 - textWidth, pageHeight - 5); 
        }

        // Save manually here to avoid Promise chaining issues in TypeScript
        pdf.save(opt.filename);
      });
  };

  const TARGET_TEACHER = "Teguh Firmansyah Apriliana, S.Pd";
  const SIGNATURE_URL = "https://i.ibb.co.com/KctJSrRC/ttd-gue.png";
  const shouldShowSignature = data.teacherName.trim() === TARGET_TEACHER;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Action Bar - Modern Glossy White/Purple */}
      <div className="sticky top-4 z-50 flex flex-wrap gap-3 justify-between items-center bg-white/80 backdrop-blur-xl border border-purple-200 p-4 rounded-xl shadow-lg shadow-purple-200/50 mb-8 no-print text-slate-900">
        <button onClick={onReset} className="flex items-center gap-2 text-slate-500 hover:text-purple-600 font-bold transition uppercase text-xs tracking-wider">
          <ArrowLeft size={16} /> Ubah Data
        </button>
        <div className="flex gap-3">
          <button onClick={handleCopyToDocs} className="flex items-center gap-2 bg-white border border-purple-200 hover:bg-purple-50 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition text-purple-700 shadow-sm">
            <Copy size={16} />
            <span className="hidden sm:inline">Salin & Buka G-Docs</span>
          </button>
          <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white border border-purple-600 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition shadow-md shadow-purple-500/30">
            <Download size={16} />
            <span className="hidden sm:inline">Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* Document Content - Strictly Black Text for PDF */}
      <div id="rpm-content" ref={contentRef} className="bg-white p-8 md:p-12 shadow-2xl min-h-screen border border-slate-200">
        <style>
            {`
              /* Base Typography */
              #rpm-content { font-family: 'Inter', sans-serif; font-size: 10pt; line-height: 1.5; color: #000000 !important; }
              
              /* Modern Table Styles */
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-bottom: 25px; 
                border: 2px solid #000000; 
                background-color: #fff;
              }
              
              th { 
                background-color: #000000;
                color: white; 
                font-weight: 700; 
                text-transform: uppercase; 
                font-size: 9pt;
                padding: 12px 14px;
                text-align: left;
                letter-spacing: 0.5px;
              }
              
              td { 
                padding: 12px 14px; 
                border-bottom: 1px solid #000000;
                vertical-align: top;
                font-size: 10pt;
                color: #000000;
              }

              /* Zebra Striping */
              tr:nth-child(even) td {
                background-color: #f8fafc; /* Slate-50 */
              }
              
              /* Remove bottom border on last row */
              tr:last-child td { border-bottom: none; }

              /* Section Titles */
              .section-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-top: 30px;
                margin-bottom: 15px;
                border-bottom: 3px solid #000000;
                padding-bottom: 8px;
              }
              
              .section-number {
                background-color: #000000;
                color: white;
                font-weight: 800;
                font-size: 12pt;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px; /* Slightly squarish */
              }

              .section-title-text {
                font-weight: 800;
                font-size: 13pt;
                color: #000000;
                text-transform: uppercase;
                letter-spacing: 1px;
              }

              /* Specific Cell Styles */
              .label-cell {
                font-weight: 700;
                color: #000000;
                background-color: #f1f5f9; /* Slate-100 */
                width: 25%;
                border-right: 1px solid #000000;
              }

              /* List Styles - Ensuring Vertical Numbering */
              ul, ol { 
                margin: 0; 
                padding-left: 20px; /* Indent for bullets/numbers */
                color: #000000;
              }
              ul { list-style-type: disc; }
              ol { list-style-type: decimal; }
              li { 
                margin-bottom: 4px; 
                padding-left: 4px;
                color: #000000;
              }

              /* Header/Kop styling */
              .header-container {
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                margin-bottom: 35px; 
                padding-bottom: 25px; 
                border-bottom: 5px solid #000000;
              }
            `}
        </style>

        {/* Kop Surat / Header */}
        <div className="header-container">
            {/* Logo Kiri */}
            <div style={{ width: '15%', display: 'flex', justifyContent: 'flex-start' }}>
                <img 
                    src="https://i.ibb.co.com/1fQ81J6v/LOGO-PEKAYON-09.jpg" 
                    alt="Logo SDN Pekayon 09" 
                    crossOrigin="anonymous"
                    style={{ height: '80px', width: 'auto' }} 
                />
            </div>

            {/* Judul Tengah */}
            <div style={{ width: '70%', textAlign: 'center' }}>
                <h1 style={{ fontWeight: '900', fontSize: '17pt', marginBottom: '8px', color: '#000000', textTransform: 'uppercase', lineHeight: '1.2', letterSpacing: '1px' }}>
                  Rencana Pembelajaran Mendalam<br/>
                  (RPM)
                </h1>
                <p style={{ fontSize: '9.5pt', color: '#000000', margin: 0, fontWeight: '500' }}>
                    SDN Pekayon 09 Jakarta Timur
                </p>
                <p style={{ fontSize: '8.5pt', color: '#000000', margin: '4px 0 0 0' }}>
                    Jl. Pendidikan Rt 04 Rw 09 Kel. Pekayon Kec. Pasar rebo
                </p>
            </div>

            {/* Logo Kanan */}
            <div style={{ width: '15%', display: 'flex', justifyContent: 'flex-end' }}>
                <img 
                    src="https://i.ibb.co.com/fz9ttjq6/Logo-of-Ministry-of-Education-and-Culture-of-Republic-of-Indonesia-svg.png" 
                    alt="Logo Kemendikbud" 
                    crossOrigin="anonymous"
                    style={{ height: '80px', width: 'auto' }} 
                />
            </div>
        </div>

        {/* 1. Identitas */}
        <div className="section-header">
            <div className="section-number">1</div>
            <div className="section-title-text">Identitas</div>
        </div>
        <table>
          <tbody>
            <tr>
              <td className="label-cell">Satuan Pendidikan (Tgl)</td>
              <td>SDN Pekayon 09 ({formatDate(data.documentDate)})</td>
              <td className="label-cell">Mata Pelajaran</td>
              <td>{data.subject}</td>
            </tr>
            <tr>
              <td className="label-cell">Kelas / Semester</td>
              <td>{data.classLevel} / {data.semester}</td>
              <td className="label-cell">Alokasi Waktu</td>
              <td>{data.duration} ({data.meetingCount} Pertemuan)</td>
            </tr>
          </tbody>
        </table>

        {/* 2. Identifikasi */}
        <div className="section-header">
            <div className="section-number">2</div>
            <div className="section-title-text">Identifikasi</div>
        </div>
        <table>
          <tbody>
            <tr>
              <td className="label-cell" style={{ width: '30%' }}>Karakteristik Siswa</td>
              <td dangerouslySetInnerHTML={{ __html: data.studentCharacteristics }}></td>
            </tr>
            <tr>
              <td className="label-cell">Materi Pelajaran</td>
              <td style={{ whiteSpace: 'pre-line' }}>{data.materi}</td>
            </tr>
            <tr>
              <td className="label-cell">Profil Lulusan</td>
              <td>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {data.dimensions.map((d, i) => (
                        <span key={i} style={{ backgroundColor: '#f1f5f9', color: '#000000', padding: '4px 10px', borderRadius: '4px', fontSize: '9pt', border: '1px solid #cbd5e1', fontWeight: '600' }}>
                            {d}
                        </span>
                    ))}
                  </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 3. Desain Pembelajaran */}
        <div className="section-header">
            <div className="section-number">3</div>
            <div className="section-title-text">Desain Pembelajaran</div>
        </div>
        <table>
          <tbody>
            <tr>
              <td className="label-cell" style={{ width: '30%' }}>Capaian Pembelajaran (CP)</td>
              <td>{data.cp}</td>
            </tr>
            <tr>
              <td className="label-cell">Lintas Disiplin Ilmu</td>
              <td dangerouslySetInnerHTML={{ __html: data.crossDisciplinary }}></td>
            </tr>
            <tr>
              <td className="label-cell">Tujuan Pembelajaran (TP)</td>
              <td style={{ whiteSpace: 'pre-line' }}>{data.tp}</td>
            </tr>
            <tr>
              <td className="label-cell">Topik Pembelajaran</td>
              <td dangerouslySetInnerHTML={{ __html: data.topics }}></td>
            </tr>
            <tr>
              <td className="label-cell">Praktik Pedagogis</td>
              <td>
                <ul style={{ paddingLeft: '20px' }}>
                  {data.meetings.map((m, i) => (
                    <li key={i}>
                        <strong>Pertemuan {m.meetingNumber}:</strong> {m.pedagogy}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
            <tr>
              <td className="label-cell">Kemitraan Pembelajaran</td>
              <td dangerouslySetInnerHTML={{ __html: data.partnerships }}></td>
            </tr>
            <tr>
              <td className="label-cell">Lingkungan Pembelajaran</td>
              <td dangerouslySetInnerHTML={{ __html: data.environment }}></td>
            </tr>
            <tr>
              <td className="label-cell">Pemanfaatan Digital</td>
              <td dangerouslySetInnerHTML={{ __html: data.digitalTools }}></td>
            </tr>
          </tbody>
        </table>

        {/* 4. Pengalaman Belajar */}
        <div className="section-header">
            <div className="section-number">4</div>
            <div className="section-title-text">Pengalaman Belajar</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Tahapan Pembelajaran</th>
              <th style={{ width: '75%' }}>Deskripsi Kegiatan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="label-cell" style={{ color: '#000000' }}>
                  Awal / Pembukaan
                  <div style={{ fontSize: '8pt', color: '#333', fontWeight: 'normal', marginTop: '4px' }}>(Memahami)</div>
              </td>
              <td dangerouslySetInnerHTML={{ __html: data.learningExperiences.memahami }}></td>
            </tr>
            <tr>
              <td className="label-cell" style={{ color: '#000000' }}>
                  Inti
                  <div style={{ fontSize: '8pt', color: '#333', fontWeight: 'normal', marginTop: '4px' }}>(Mengaplikasi)</div>
              </td>
              <td dangerouslySetInnerHTML={{ __html: data.learningExperiences.mengaplikasi }}></td>
            </tr>
            <tr>
              <td className="label-cell" style={{ color: '#000000' }}>
                  Penutup
                  <div style={{ fontSize: '8pt', color: '#333', fontWeight: 'normal', marginTop: '4px' }}>(Refleksi)</div>
              </td>
              <td dangerouslySetInnerHTML={{ __html: data.learningExperiences.refleksi }}></td>
            </tr>
          </tbody>
        </table>

        {/* 5. Asesmen Pembelajaran */}
        <div className="section-header">
            <div className="section-number">5</div>
            <div className="section-title-text">Asesmen Pembelajaran</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ width: '33%' }}>Asesmen Awal</th>
              <th style={{ width: '33%' }}>Asesmen Proses</th>
              <th style={{ width: '34%' }}>Asesmen Akhir</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td dangerouslySetInnerHTML={{ __html: data.assessments.initial }}></td>
              <td dangerouslySetInnerHTML={{ __html: data.assessments.process }}></td>
              <td dangerouslySetInnerHTML={{ __html: data.assessments.final }}></td>
            </tr>
          </tbody>
        </table>

        {/* 6. Rubrik Penilaian */}
        <div className="section-header">
            <div className="section-number">6</div>
            <div className="section-title-text">Rubrik Penilaian: {data.rubric.title}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{width: '20%'}}>Kriteria / Aspek</th>
              <th style={{width: '20%'}}>Sangat Baik (4)</th>
              <th style={{width: '20%'}}>Baik (3)</th>
              <th style={{width: '20%'}}>Cukup (2)</th>
              <th style={{width: '20%'}}>Perlu Bimbingan (1)</th>
            </tr>
          </thead>
          <tbody>
            {data.rubric.rows.map((row, index) => (
              <tr key={index}>
                <td style={{fontWeight: 'bold', backgroundColor: '#f8fafc'}}>{row.aspect}</td>
                <td>{row.score4}</td>
                <td>{row.score3}</td>
                <td>{row.score2}</td>
                <td>{row.score1}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signatures */}
        <div className="signature-box" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', pageBreakInside: 'avoid' }}>
            <div style={{ textAlign: 'center', width: '40%' }}>
                <p style={{ margin: 0 }}>Mengetahui,</p>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Kepala SDN Pekayon 09</p>
                <div style={{ height: '180px' }}></div>
                <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0 }}>{data.principalName}</p>
                <p style={{ margin: 0 }}>NIP. {data.principalNIP}</p>
            </div>
            <div style={{ textAlign: 'center', width: '40%' }}>
                <p style={{ margin: 0 }}>Jakarta, {formatDate(data.documentDate)}</p>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Guru Kelas / Mata Pelajaran</p>
                
                <div style={{ 
                    height: '180px', 
                    display: 'flex', 
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                }}>
                   {shouldShowSignature && (
                      <img 
                        src={SIGNATURE_URL} 
                        alt="Tanda Tangan" 
                        crossOrigin="anonymous" 
                        style={{ 
                            height: '125px', 
                            width: 'auto',
                            marginBottom: '-10px' 
                        }} 
                      />
                   )}
                </div>

                <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0 }}>{data.teacherName}</p>
                <p style={{ margin: 0 }}>NIP. {data.teacherNIP}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RPMPreview;