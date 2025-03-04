interface ScreenTimePresentationProps {
  data: {
    appUsage: Array<{
      name: string;
      timeSpent: number;
      sessions: number;
    }>;
    websiteUsage: Array<{
      name: string;
      timeSpent: number;
      visits: number;
    }>;
    textContent: string;
    rawUiRecords: any[];
    rawOcrRecords: any[];
  };
}

declare module "@/components/screen-time-presentation" {
  export default function ScreenTimePresentation(props: ScreenTimePresentationProps): JSX.Element;
} 