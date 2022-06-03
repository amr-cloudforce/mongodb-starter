import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllUsers, updateUser } from 'lib/api/user';
import { getSession } from 'next-auth/react';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const result = await getAllUsers(req.query.query as string);
      return res.status(200).json(result);
    } catch (e: any) {
      console.log(e);
      return res.status(500).json({
        error: e.toString()
      });
    }
  } else if (req.method === 'PUT') {
    const { username, image, bio } = req.body;
    console.log(req.body);
    const session = await getSession({ req });
    if (!session || session.username !== username) {
      return res.status(401).json({
        error: 'Unauthorized'
      });
    }
    try {
      const result = await updateUser(username, image, bio);
      if (result) {
        await res.unstable_revalidate(`/${username}`);
      }
      return res.status(200).json(result);
    } catch (e: any) {
      console.log(e);
      return res.status(500).json({
        error: e.toString()
      });
    }
  } else {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
