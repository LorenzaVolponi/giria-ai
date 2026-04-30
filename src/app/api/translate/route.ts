import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { slang?: string }
    const raw = body?.slang

    if (!raw || typeof raw !== 'string') {
      return NextResponse.json(
        { error: 'O campo "slang" é obrigatório.' },
        { status: 400 },
      )
    }

    const input = raw.trim().toLowerCase()

    if (input.length === 0) {
      return NextResponse.json(
        { error: 'O termo não pode estar vazio.' },
        { status: 400 },
      )
    }

    return NextResponse.json({
      term: input,
      meaning: 'Use a busca da página principal para traduzir gírias.',
      context: 'Todas as traduções são feitas localmente no navegador.',
      category: 'outros',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 },
    )
  }
}
