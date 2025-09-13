// src/common/utils/device-parser.ts
// @ts-ignore
import useragent from 'user-agent';
import requestIp from 'request-ip';
import { Request } from 'express';

export const parseDevice = (req: Request) => {
  const agent = useragent.parse(req.headers['user-agent'] || '');
  const ip = requestIp.getClientIp(req) || 'unknown';
  return {
    ipAddress: ip,
    browser: agent.family,
    os: agent.os.family,
    deviceType: agent.device.family || 'Unknown',
    userAgent: req.headers['user-agent'] || '',
  };
};
