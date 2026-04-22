import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function PATCH(req, { params }) {
  const { id } = params;
  const { status, old_status, changed_by } = await req.json();

  // 1. Update the article status
  const { data: article, error: updateError } = await supabase
    .from('articles')
    .update({ status })
    .eq('id', id)
    .select();

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  // 2. Save to Version History
  if (old_status !== status) {
    await supabase.from('article_versions').insert([{
      article_id: id,
      old_status: old_status,
      new_status: status,
      changed_by: changed_by
    }]);
  }

  return NextResponse.json(article[0]);
}

export async function DELETE(req, { params }) {
  const { id } = params;
  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}