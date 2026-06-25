export function getDeviceInfo(req: any) {
  const device = {
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent'] || 'unknown',
  };
  return device;
}
