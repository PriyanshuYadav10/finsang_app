import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system";
import Share from "react-native-share";

export async function shareProduct({ product, user }) {
  console.log('shareProduct called with:', { productId: product?.id, userId: user?.id });
  
  if (!product) {
    console.log('No product provided, returning');
    return;
  }

  // Compose benefits with emojis
  const benefits = Array.isArray(product.benefits)
    ? product.benefits
        .map((b) => {
          if (b.toLowerCase().includes("reward")) return `🎫 ${b}`;
          if (b.toLowerCase().includes("lounge")) return `✈️ ${b}`;
          if (
            b.toLowerCase().includes("night") ||
            b.toLowerCase().includes("award")
          )
            return `🏆 ${b}`;
          return `⭐ ${b}`;
        })
        .join("\n")
    : "";

  // Create the form URL with product and sender details
  const formUrl = `https://admin.finsang.in/shared-product-form?productId=${
    product.id
  }&senderId=${user?.id || ""}`;

  const message = `
Stay, Earn Points & Enjoy with ${product.card_name}!

Why choose ${product.card_name}?
${benefits}

Why apply from here?
✔️ 100% online process
✔️ Minimal documentation

Apply for your ${product.card_name} today.
🔗 CLICK HERE TO APPLY:
${formUrl}

For any queries, call +${user?.phone || ""} or +91 7417274072 for quick support.

${user?.name || ""}
  `.trim();

  console.log('Share message created:', message.substring(0, 100) + '...');

  if (product.Image_url) {
    console.log('Product has image URL:', product.Image_url);
    try {
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        product.Image_url
      );
      const fileUri = FileSystem.cacheDirectory + hash + ".png";
      console.log('Image file URI:', fileUri);

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        console.log('Image not cached, downloading...');
        const downloadResumable = FileSystem.createDownloadResumable(
          product.Image_url,
          fileUri
        );
        await downloadResumable.downloadAsync();
        console.log('Image downloaded successfully');
      } else {
        console.log('Image already cached');
      }

      const shareOptions = {
        title: product.card_name,
        message: message,
        url: fileUri,
        subject: `Check out ${product.card_name}`,
        failOnCancel: false,
      };
      console.log('Opening share with options:', shareOptions);
      
      await Share.open(shareOptions);
      console.log('Share completed successfully');
    } catch (e) {
      console.warn("Image download failed, sharing only text.", e);
      await Share.open({
        message,
        failOnCancel: false,
      });
    }
  } else {
    console.log('No image URL, sharing text only');
    await Share.open({
      message,
      failOnCancel: false,
    });
  }
}
