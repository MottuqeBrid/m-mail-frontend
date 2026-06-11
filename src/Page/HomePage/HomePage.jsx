import Logo from "../../Components/Logo/Logo";

const HomePage = () => {
  return (
    <div>
      <section className="hero bg-base-200 min-h-[80vh]">
        <div className="hero-content text-center flex-col gap-8">
          <Logo size="xl" />
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold">m-mail</h1>
            <p className="py-6 text-base-content/70">
              Fast, secure, and simple email for everyone.
            </p>
            <button className="btn btn-primary">Get started</button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Fast", desc: "Lightning-fast email delivery with zero downtime." },
            { title: "Secure", desc: "End-to-end encryption keeps your data private." },
            { title: "Simple", desc: "Clean interface designed for productivity." },
          ].map((f) => (
            <div key={f.title} className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title">{f.title}</h3>
                <p className="text-base-content/70">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary text-primary-content py-20 text-center px-4">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="mb-6 opacity-80">Create your free account today.</p>
        <button className="btn btn-accent">Sign up free</button>
      </section>
    </div>
  );
};

export default HomePage;
