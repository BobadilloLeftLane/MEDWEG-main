/**
 * Product Image Utilities
 * Automatic image mapping based on product type
 */

export const getProductImageUrl = (
  type: 'gloves' | 'disinfectant_liquid' | 'disinfectant_wipes',
  customImageUrl?: string | null
): string => {
  // If custom image URL is provided, use it
  if (customImageUrl) {
    return customImageUrl;
  }

  // Default images based on product type
  const imageMap: Record<string, string> = {
    gloves: '/images/products/ppe-gloves@2x.png',
    disinfectant_liquid: '/images/products/ppe-sanitizer@2x.png',
    disinfectant_wipes: '/images/products/disinfecting-wipes@2x.png',
  };

  return imageMap[type] || '/images/products/ppe-gloves@2x.png';
};

export const getProductImagePath = (type: string): string => {
  const imageMap: Record<string, string> = {
    gloves: '/images/products/ppe-gloves@2x.png',
    disinfectant_liquid: '/images/products/ppe-sanitizer@2x.png',
    disinfectant_wipes: '/images/products/disinfecting-wipes@2x.png',
  };

  return imageMap[type] || '/images/products/ppe-gloves@2x.png';
};
