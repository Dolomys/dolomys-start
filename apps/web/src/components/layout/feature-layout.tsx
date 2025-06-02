interface FeatureLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const FeatureLayout = (props: FeatureLayoutProps) => {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold">{props.title}</h1>
        <h3 className="text-lg font-medium text-gray-500">{props.subtitle}</h3>
      </div>
      <div className="pt-4">{props.children}</div>
    </div>
  );
};
