export default {
  async fetch(request) {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const templateNumber = pathParts[pathParts.length - 1];

    if (!templateNumber) {
      return new Response(JSON.stringify({ error: "Template number not provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      // URLs for RobloxDex
      const apiUrl = `https://robloxdex.com/api/template/${templateNumber}`;
      const imageUrl = `https://robloxdex.com/template/${templateNumber}.png`;

      // Fetch the API data
      const apiResponse = await fetch(apiUrl);
      if (!apiResponse.ok) {
        return new Response(JSON.stringify({ error: `Failed to fetch API data: ${apiResponse.status}` }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Fetch the image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        return new Response(JSON.stringify({ error: `Failed to fetch image: ${imageResponse.status}` }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Discord webhook
      const webhookUrl = "https://discord.com/api/webhooks/1311296915421397073/n7xhglwGGUucgZt9JecEuBFQGDAZsmQhw5b8fi852ZSkCVhbK4_6s4yDFEtR1OIONmLy";
      const formData = new FormData();
      formData.append("content", `Here is the RobloxDex template image for ${templateNumber}.`);
      formData.append("file", await imageResponse.blob(), "image.png");

      // Send image to Discord
      const discordResponse = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
      });

      if (!discordResponse.ok) {
        const discordErrorText = await discordResponse.text();
        return new Response(
          JSON.stringify({ error: `Failed to send image to Discord: ${discordResponse.status}`, details: discordErrorText }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // Parse Discord response
      const discordData = await discordResponse.json();
      const cdnUrl = discordData.attachments?.[0]?.url || "URL not found";

      return new Response(
        JSON.stringify({
          message: "Image sent successfully to Discord!",
          discord_cdn_url: cdnUrl,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Unexpected error occurred", details: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
