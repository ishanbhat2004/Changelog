import ChangelogList from '../components/ChangelogList';

export default function ClientPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Developer Changelog Generator</h1>
      <ChangelogList />
    </div>
  );
}
