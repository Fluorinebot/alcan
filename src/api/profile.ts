import type { FluorineClient } from '#classes';
import { Replace } from '#types';
import type { Profile } from '@prisma/client';
import type { FastifyReply, FastifyRequest } from 'fastify';

export async function getProfile(client: FluorineClient, req: FastifyRequest, res: FastifyReply) {
    const { authorization } = req.cookies as { authorization: string };
    const { id } = await client.oauth.verify(authorization);

    const profile = await client.prisma.profile.findUnique({ where: { userId: BigInt(id) } });
    const proccessed: Replace<Profile, 'userId', string | bigint> = { ...profile };
    proccessed.userId = profile.userId.toString();

    res.send(proccessed);
}

export async function patchProfile(client: FluorineClient, req: FastifyRequest, res: FastifyReply) {
    const { authorization } = req.cookies as { authorization: string };
    const { id } = await client.oauth.verify(authorization);
    const body = req.body as Partial<Profile>;

    if ('userId' in body) {
        res.status(405).send();
    }

    await client.prisma.profile.update({ where: { userId: BigInt(id) }, data: body });
    res.status(204).send();
}
