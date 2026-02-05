declare module "@tanstack/react-query" {
  export function useQuery<T = any>(options: any): { data: T; isLoading: boolean; [key: string]: any };
  export function useMutation(options: any): any;
  export function useQueryClient(): any;
  export class QueryClient {}
  export function QueryClientProvider(props: any): any;
}

declare module "lucide-react" {
  import * as React from 'react';
  export const LayoutDashboard: React.FC<any>;
  export const ReceiptText: React.FC<any>;
  export const Wallet: React.FC<any>;
  export const PieChart: React.FC<any>;
  export const Target: React.FC<any>;
  export const TrendingUp: React.FC<any>;
  export const Sparkles: React.FC<any>;
  export const Settings: React.FC<any>;
  export const ArrowUpCircle: React.FC<any>;
  export const ArrowDownCircle: React.FC<any>;
  export const MoreHorizontal: React.FC<any>;
  export const Plus: React.FC<any>;
  export const Filter: React.FC<any>;
  export const Loader2: React.FC<any>;
  export const Send: React.FC<any>;
  export const User: React.FC<any>;
  export const Bot: React.FC<any>;
  export const CreditCard: React.FC<any>;
  export const Banknote: React.FC<any>;
  export const Landmark: React.FC<any>;
  export const AlertCircle: React.FC<any>;
  export const Eye: React.FC<any>;
  export const EyeOff: React.FC<any>;
  export const Bell: React.FC<any>;
  export const Search: React.FC<any>;
  export const Menu: React.FC<any>;
  export const LogOut: React.FC<any>;
}

declare module "@langchain/openai" {
  export class ChatOpenAI {
    constructor(config: any);
    invoke(input: any): Promise<any>;
    pipe(next: any): any;
  }
  export class OpenAIEmbeddings {
    constructor(config: any);
    embedQuery(text: string): Promise<number[]>;
  }
}

declare module "@langchain/core/prompts" {
  export class PromptTemplate {
    static fromTemplate(template: string): any;
  }
}

declare module "recharts" {
  import * as React from 'react';
  export class ResponsiveContainer extends React.Component<any> {}
  export class PieChart extends React.Component<any> {}
  export class Pie extends React.Component<any> {}
  export class Cell extends React.Component<any> {}
  export class Tooltip extends React.Component<any> {}
  export class Legend extends React.Component<any> {}
  export class BarChart extends React.Component<any> {}
  export class Bar extends React.Component<any> {}
  export class XAxis extends React.Component<any> {}
  export class YAxis extends React.Component<any> {}
  export class CartesianGrid extends React.Component<any> {}
  export class LineChart extends React.Component<any> {}
  export class Line extends React.Component<any> {}
  export class AreaChart extends React.Component<any> {}
  export class Area extends React.Component<any> {}
}
