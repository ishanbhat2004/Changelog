import DeveloperForm from '../components/DeveloperForm';

export default function DeveloperPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Developer Changelog Generator</h1>
      <DeveloperForm />
    </div>
  );
}
