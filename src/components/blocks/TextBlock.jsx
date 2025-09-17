// src/components/blocks/TextBlock.jsx

export default function TextBlock({ title, content }) {
  return (
    <section className="max-w-3xl mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold mb-4 font-iowan text-center">{title || 'Untitled'}</h2>
      <p className="text-lg leading-relaxed font-iowan text-justify">{content || ''}</p>
    </section>
  );
}