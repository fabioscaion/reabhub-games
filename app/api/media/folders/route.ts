import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  try {
    const folders = await prisma.mediaFolder.findMany({
      where: {
        userId: session.user.id,
        ...(type ? { type } : {}),
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error('Erro ao buscar pastas:', error);
    return NextResponse.json({ error: 'Falha ao buscar pastas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { name, type } = await req.json();

    if (!name || !type) {
      return NextResponse.json({ error: 'Nome e tipo são obrigatórios' }, { status: 400 });
    }

    const folder = await prisma.mediaFolder.create({
      data: {
        name,
        type,
        userId: session.user.id,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error('Erro ao criar pasta:', error);
    return NextResponse.json({ error: 'Falha ao criar pasta' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { id, name } = await req.json();

    if (!id || !name) {
      return NextResponse.json({ error: 'ID e nome são obrigatórios' }, { status: 400 });
    }

    const folder = await prisma.mediaFolder.update({
      where: { id, userId: session.user.id },
      data: { name },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error('Erro ao atualizar pasta:', error);
    return NextResponse.json({ error: 'Falha ao atualizar pasta' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    // Ao deletar uma pasta, as mídias dentro dela ficam sem pasta (folderId set to null via schema onDelete: SetNull)
    await prisma.mediaFolder.delete({
      where: { id, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar pasta:', error);
    return NextResponse.json({ error: 'Falha ao deletar pasta' }, { status: 500 });
  }
}
