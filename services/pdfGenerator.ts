import jsPDF from 'jspdf';
import { FisherData } from '../types';
import { getDocument } from './documentStorage';

export const generateRequestPDF = async (fisher: FisherData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Requerimento de Seguro-Defeso', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 20, 30, { align: 'right' });

    // Fisher Info
    doc.setDrawColor(0);
    doc.setFillColor(240, 240, 240);
    doc.rect(14, 40, pageWidth - 28, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Dados do Pescador', 20, 46);

    let y = 60;
    const addLine = (label: string, value: string) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 60, y);
        y += 10;
    };

    addLine('Nome', fisher.name);
    addLine('CPF', fisher.cpf || 'Não informado');
    addLine('RGP', fisher.rgp);
    addLine('Região', fisher.region);

    // Disclaimer
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Declaro que as informações acima são verdadeiras e que a pesca é minha atividade profissional ininterrupta.', 20, y, { maxWidth: pageWidth - 40 });

    // Document Images
    y += 30;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text('Anexos (Documentação)', 20, y);
    y += 10;

    const addImageToPDF = async (type: 'rgp' | 'cpf' | 'address', label: string) => {
        const blob = await getDocument(type);
        if (blob) {
            // Check if Y is near bottom, add page
            if (y > 200) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(12);
            doc.text(label, 20, y);
            y += 5;

            // Convert blob to base64
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });

            // Add image
            // Keep aspect ratio roughly, max height 100
            try {
                const imgProps = doc.getImageProperties(base64);
                const pdfWidth = pageWidth - 40;
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                // If image is too tall, scale down
                const finalHeight = Math.min(pdfHeight, 120);
                const finalWidth = (imgProps.width * finalHeight) / imgProps.height;

                doc.addImage(base64, 'JPEG', 20, y, finalWidth, finalHeight);
                y += finalHeight + 20;
            } catch (e) {
                doc.text('[Erro ao adicionar imagem]', 20, y + 10);
                y += 20;
            }
        } else {
            doc.setFontSize(10);
            doc.setTextColor(200, 0, 0); // Red
            doc.text(`[${label} Pendente]`, 20, y);
            doc.setTextColor(0);
            y += 15;
        }
    };

    await addImageToPDF('rgp', 'Carteira RGP');
    await addImageToPDF('cpf', 'Documento de Identidade / CPF');
    await addImageToPDF('address', 'Comprovante de Residência');

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Gerado pelo App Seguro-Defeso Fácil - Serviço Gratuito', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save(`Requerimento_SD_${fisher.name.split(' ')[0]}.pdf`);
};
