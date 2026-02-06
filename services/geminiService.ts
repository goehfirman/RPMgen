import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FormData, GeneratedContent, Subject, ClassLevel } from "../types";
import { CP_REF } from "../data/cpReference";

// Helper to create AI instance dynamically
const getAI = (apiKey: string) => new GoogleGenAI({ apiKey });

const generatedContentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    studentCharacteristics: { type: Type.STRING, description: "Description of student characteristics based on age/class. Return as HTML Unordered List (<ul><li>...</li></ul>)." },
    crossDisciplinary: { type: Type.STRING, description: "Connection to other subjects. Return as HTML Unordered List (<ul><li>...</li></ul>)." },
    topics: { type: Type.STRING, description: "Specific learning topics derived from material. Return as HTML Unordered List (<ul><li>...</li></ul>)." },
    partnerships: { type: Type.STRING, description: "Learning partnerships (parents, experts, community). Return as HTML Unordered List (<ul><li>...</li></ul>)." },
    environment: { type: Type.STRING, description: "Learning environment setup. Return as HTML Unordered List (<ul><li>...</li></ul>)." },
    digitalTools: { type: Type.STRING, description: "Recommended digital tools and how to use them. Return as HTML Unordered List (<ul><li>...</li></ul>)." },
    learningExperiences: {
      type: Type.OBJECT,
      properties: {
        memahami: { type: Type.STRING, description: "Activity for 'Memahami' phase (Opening). Return as HTML Ordered List (<ol><li>...</li></ol>)." },
        mengaplikasi: { type: Type.STRING, description: "Activity for 'Mengaplikasi' phase (Core) matching the pedagogy syntax. Return as HTML Ordered List (<ol><li>...</li></ol>)." },
        refleksi: { type: Type.STRING, description: "Activity for 'Refleksi' phase (Closing). Return as HTML Ordered List (<ol><li>...</li></ol>)." },
      },
      required: ["memahami", "mengaplikasi", "refleksi"]
    },
    assessments: {
      type: Type.OBJECT,
      properties: {
        initial: { type: Type.STRING, description: "Diagnostic assessment ideas. Return as HTML Unordered List (<ul><li>...</li></ul>)." },
        process: { type: Type.STRING, description: "Formative assessment (rubric, observation). Return as HTML Unordered List (<ul><li>...</li></ul>)." },
        final: { type: Type.STRING, description: "Summative assessment (product, portfolio). Return as HTML Unordered List (<ul><li>...</li></ul>)." },
      },
      required: ["initial", "process", "final"]
    },
    rubric: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Title of the assessment rubric." },
        rows: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              aspect: { type: Type.STRING, description: "Assessment criteria/aspect." },
              score4: { type: Type.STRING, description: "Description for score 4 (Sangat Baik)." },
              score3: { type: Type.STRING, description: "Description for score 3 (Baik)." },
              score2: { type: Type.STRING, description: "Description for score 2 (Cukup)." },
              score1: { type: Type.STRING, description: "Description for score 1 (Perlu Bimbingan)." },
            },
            required: ["aspect", "score4", "score3", "score2", "score1"]
          }
        }
      },
      required: ["title", "rows"]
    }
  },
  required: ["studentCharacteristics", "crossDisciplinary", "topics", "partnerships", "environment", "digitalTools", "learningExperiences", "assessments", "rubric"]
};

export const generateRPM = async (data: FormData, apiKey: string): Promise<GeneratedContent> => {
  if (!apiKey) throw new Error("API Key wajib diisi.");

  const ai = getAI(apiKey);
  const pedagogies = data.meetings.map(m => `Pertemuan ${m.meetingNumber}: ${m.pedagogy}`).join(", ");
  const dimensions = data.dimensions.join(", ");

  const prompt = `
    Bertindaklah sebagai ahli kurikulum SD Indonesia. Buatlah konten Rencana Pembelajaran Mendalam (RPM) untuk SDN Pekayon 09.
    
    Data Input:
    - Kelas: ${data.classLevel}
    - Mapel: ${data.subject}
    - Materi: ${data.materi}
    - CP: ${data.cp}
    - TP: ${data.tp}
    - Dimensi Profil Lulusan (Profil Pelajar): ${dimensions}
    - Praktik Pedagogis per Pertemuan: ${pedagogies}

    Tugas:
    Lengkapi bagian-bagian rencana pembelajaran yang kosong berikut ini dengan bahasa Indonesia yang formal, edukatif, namun aplikatif.
    
    INSTRUKSI FORMATTING PENTING:
    Gunakan tag HTML <ul> dan <li> untuk membuat list bullet points agar output terlihat rapi dan menurun ke bawah (numbering/list).
    Gunakan tag HTML <ol> dan <li> untuk langkah-langkah kegiatan yang berurutan.

    1. Karakteristik Siswa (Siswa): Deskripsikan karakteristik umum siswa kelas ${data.classLevel} SD. Format: <ul><li>...</li></ul>
    2. Lintas Disiplin Ilmu: Hubungkan materi ini dengan mata pelajaran lain. Format: <ul><li>...</li></ul>
    3. Topik Pembelajaran: Breakdown materi menjadi topik spesifik. Format: <ul><li>...</li></ul>
    4. Kemitraan: Siapa yang bisa dilibatkan? Format: <ul><li>...</li></ul>
    5. Lingkungan: Bagaimana setting kelas/luar kelas? Format: <ul><li>...</li></ul>
    6. Digital: Rekomendasi tools spesifik (misal: Quizizz, Canva, Youtube, dll). Format: <ul><li>...</li></ul>
    7. Pengalaman Belajar:
       - Memahami (Awal): Kegiatan pemantik yang 'berkesadaran/bermakna/menggembirakan'. Format: <ol><li>...</li></ol>
       - Mengaplikasi (Inti): Rangkaian kegiatan inti yang SANGAT SESUAI dengan sintaks ${pedagogies}. Jika ada beda pedagogi tiap pertemuan, gabungkan narasi sintaksnya. Format: <ol><li>...</li></ol>
       - Refleksi (Penutup): Kegiatan penutup. Format: <ol><li>...</li></ol>
    8. Asesmen: Awal, Proses, dan Akhir. Semuanya Format: <ul><li>...</li></ul>
    9. Rubrik Penilaian: Buat tabel rubrik penilaian dengan skala 1-4 untuk mengevaluasi pencapaian TP. Sertakan 3-5 aspek penilaian.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: generatedContentSchema,
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as GeneratedContent;
  } catch (error) {
    console.error("Error generating RPM:", error);
    throw error; // Re-throw to handle in UI
  }
};

const getPhase = (classLevel: string): 'FaseA' | 'FaseB' | 'FaseC' => {
  if (classLevel === ClassLevel.Kelas1 || classLevel === ClassLevel.Kelas2) return 'FaseA';
  if (classLevel === ClassLevel.Kelas3 || classLevel === ClassLevel.Kelas4) return 'FaseB';
  return 'FaseC';
};

export const getFieldSuggestions = async (
  field: 'cp' | 'tp' | 'materi',
  subject: Subject,
  classLevel: ClassLevel,
  apiKey: string,
  currentContext: string = "" 
): Promise<string[]> => {
    if (!apiKey) return ["Harap masukkan API Key terlebih dahulu."];

    const ai = getAI(apiKey);
    let fieldName = "";
    let promptContext = "";

    const phase = getPhase(classLevel);
    
    // Check if we have official CP reference data from the PDF
    const officialCP = CP_REF[subject]?.[phase];

    if (field === 'cp') {
        fieldName = "Capaian Pembelajaran (CP)";
        if (officialCP) {
          promptContext = `
            Berikut adalah referensi CP RESMI (Kurikulum Merdeka) untuk ${subject} Fase ${phase.replace('Fase', '')}:
            "${officialCP}"
            
            Tugas: Buat 5 variasi kalimat CP yang spesifik berdasarkan referensi di atas. Pecah menjadi poin-poin fokus jika referensi terlalu panjang.
          `;
        } else {
          promptContext = `Buat 5 opsi CP yang sesuai Kurikulum Merdeka untuk mapel ini.`;
        }
    } else if (field === 'tp') {
        fieldName = "Tujuan Pembelajaran (TP)";
        if (currentContext && currentContext.length > 5) {
           promptContext = `
             User telah memilih Capaian Pembelajaran (CP) berikut:
             "${currentContext}"

             Tugas: Turunkan 5 opsi Tujuan Pembelajaran (TP) yang logis, terukur, dan spesifik yang BERSUMBER LANGSUNG dari CP di atas.
           `;
        } else {
           // Fallback if no CP is selected, look at official CP if available
           if (officialCP) {
             promptContext = `
               Gunakan referensi CP Fase ${phase.replace('Fase', '')} berikut: "${officialCP}".
               Buat 5 opsi Tujuan Pembelajaran (TP) yang relevan.
             `;
           }
        }
    } else if (field === 'materi') {
        fieldName = "Materi Pelajaran";
        if (currentContext) {
           promptContext = `Berdasarkan CP/TP berikut: "${currentContext}", sarankan 5 topik materi pokok yang relevan.`;
        }
    }

    const prompt = `
      Berikan 5 opsi pilihan ${fieldName} untuk mata pelajaran ${subject} Kelas ${classLevel} SD.
      ${promptContext}
      Output wajib JSON: { "options": ["opsi 1", "opsi 2", ...] }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        const result = JSON.parse(response.text || "{}");
        return result.options || [];
    } catch (e) {
        console.error(e);
        return ["Gagal mengambil saran. Periksa API Key Anda."];
    }
};