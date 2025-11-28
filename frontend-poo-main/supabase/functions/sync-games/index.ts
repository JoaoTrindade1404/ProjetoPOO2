import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { games, apiUrl } = await req.json();

    console.log('Syncing games from Java API:', { apiUrl, gamesCount: games?.length });

    // If games are provided directly, use them
    if (games && Array.isArray(games)) {
      for (const game of games) {
        const { error } = await supabaseClient
          .from('games')
          .upsert({
            external_id: game.id,
            title: game.title || game.nome,
            description: game.description || game.descricao,
            image_url: game.image_url || game.imagemUrl || game.image,
            price: parseFloat(game.price || game.preco || 0),
            original_price: parseFloat(game.original_price || game.precoOriginal || game.price || game.preco || 0),
            discount: parseInt(game.discount || game.desconto || 0),
            rating: parseFloat(game.rating || game.avaliacao || 0),
            tags: game.tags || game.categorias || []
          }, { onConflict: 'external_id' });

        if (error) {
          console.error('Error upserting game:', error);
        }
      }

      return new Response(
        JSON.stringify({ success: true, synced: games.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If apiUrl is provided, fetch games from Java API
    if (apiUrl) {
      console.log('Fetching games from:', apiUrl);
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const apiGames = await response.json();
      const gamesArray = Array.isArray(apiGames) ? apiGames : apiGames.data || apiGames.games || [];

      for (const game of gamesArray) {
        const { error } = await supabaseClient
          .from('games')
          .upsert({
            external_id: game.id,
            title: game.title || game.nome,
            description: game.description || game.descricao,
            image_url: game.image_url || game.imagemUrl || game.image,
            price: parseFloat(game.price || game.preco || 0),
            original_price: parseFloat(game.original_price || game.precoOriginal || game.price || game.preco || 0),
            discount: parseInt(game.discount || game.desconto || 0),
            rating: parseFloat(game.rating || game.avaliacao || 0),
            tags: game.tags || game.categorias || []
          }, { onConflict: 'external_id' });

        if (error) {
          console.error('Error upserting game:', error);
        }
      }

      return new Response(
        JSON.stringify({ success: true, synced: gamesArray.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Either games array or apiUrl must be provided' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing games:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});