
import { aiTools } from './aiTools';
import { automationTools } from './automationTools';
import { mediaTools } from './mediaTools';
import { communicationTools } from './communicationTools';
import { productivityTools } from './productivityTools';
import { developmentTools } from './developmentTools';
import { analyticsTools } from './analyticsTools';
import { crmTools } from './crmTools';
import { ToolItem } from '../types/toolItemTypes';

export const availableTools: ToolItem[] = [
  ...aiTools,
  ...automationTools,
  ...mediaTools,
  ...communicationTools,
  ...productivityTools,
  ...developmentTools,
  ...analyticsTools,
  ...crmTools
];

export * from './aiTools';
export * from './automationTools';
export * from './mediaTools';
export * from './communicationTools';
export * from './productivityTools';
export * from './developmentTools';
export * from './analyticsTools';
export * from './crmTools';
