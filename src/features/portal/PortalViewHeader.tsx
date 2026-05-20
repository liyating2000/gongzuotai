type PortalViewHeaderProps = {
  greeting: string;
};

export default function PortalViewHeader({ greeting }: PortalViewHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <h1 className="text-lg font-bold text-slate-800">{greeting}</h1>
    </div>
  );
}
