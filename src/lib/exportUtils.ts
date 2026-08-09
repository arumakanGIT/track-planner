import { toPng } from 'html-to-image';

/**
 * Export a DOM element as a high-resolution PNG image.
 */
export async function exportElementAsPng(elementId: string, fileName: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Export error: Element with ID '${elementId}' not found.`);
    alert(`عنصر مورد نظر یافت نشد (${elementId})`);
    return;
  }

  try {
    const isDarkMode = document.documentElement.classList.contains('dark');

    // Generate high resolution PNG using html-to-image which supports modern CSS (oklch, CSS variables, Tailwind 4)
    const dataUrl = await toPng(element, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
      style: {
        padding: '16px',
        borderRadius: '16px',
        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
      },
      // Prevent font fetching timeout issues
      cacheBust: false,
    });

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to export image:', error);
    alert('خطا در تهیه تصویر از صفحه. لطفاً مجدداً تلاش کنید.');
  }
}


