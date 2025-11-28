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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Get cart items
    const { data: cartItems, error: cartError } = await supabaseClient
      .from('cart_items')
      .select(`
        id,
        game_id,
        games (
          id,
          title,
          price,
          image_url
        )
      `)
      .eq('user_id', user.id);

    if (cartError) {
      console.error('Error fetching cart:', cartError);
      throw cartError;
    }

    if (!cartItems || cartItems.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cart is empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate total
    const totalAmount = cartItems.reduce((sum, item: any) => {
      return sum + (item.games?.price || 0);
    }, 0);

    // Create order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        status: 'completed'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }

    // Create order items and library items
    for (const item of cartItems) {
      // Add to order items
      await supabaseClient
        .from('order_items')
        .insert({
          order_id: order.id,
          game_id: item.game_id,
          price: (item as any).games?.price || 0
        });

      // Add to library (check if exists first)
      const { data: existingItem } = await supabaseClient
        .from('library_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('game_id', item.game_id)
        .maybeSingle();

      if (!existingItem) {
        await supabaseClient
          .from('library_items')
          .insert({
            user_id: user.id,
            game_id: item.game_id,
            play_time: 0,
            installed: false,
            achievements: 0
          });
      }
    }

    // Clear cart
    await supabaseClient
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    console.log('Order processed successfully:', order.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        order_id: order.id,
        total: totalAmount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing checkout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});