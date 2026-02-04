import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadToGCS, deleteFromGCS } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'image' | 'audio'
    const name = formData.get('name') as string || file.name;
    const folderId = formData.get('folderId') as string || null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.split('.').pop() || (type === 'audio' ? 'webm' : 'png');
    const filename = `${uuidv4()}.${extension}`;
    
    const url = await uploadToGCS(buffer, filename, file.type);

    const media = await prisma.media.create({
      data: {
        url,
        name,
        type,
        userId: session.user.id,
        organizationId: session.user.organizationId,
        folderId: folderId && folderId !== 'all' ? folderId : null,
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ error: 'Falha no upload' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const folderId = searchParams.get('folderId');

  try {
    const media = await prisma.media.findMany({
      where: {
        userId: session.user.id,
        ...(type ? { type } : {}),
        ...(folderId ? { folderId: folderId === 'root' ? null : folderId } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao buscar mídias' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    
    // Verifica se está vinculado a algum jogo
    const usageCount = await prisma.gameMedia.count({
      where: { mediaId: id },
    });

    if (usageCount > 0) {
      return NextResponse.json({ error: 'Esta mídia está em uso em um jogo e não pode ser excluída' }, { status: 400 });
    }

    const media = await prisma.media.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!media) {
      return NextResponse.json({ error: 'Mídia não encontrada' }, { status: 404 });
    }

    // Deleta do GCS
    const filename = media.url.split('/').pop();
    if (filename) {
      await deleteFromGCS(filename);
    }

    // Deleta do DB
    await prisma.media.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar:', error);
    return NextResponse.json({ error: 'Falha ao excluir mídia' }, { status: 500 });
  }
}
