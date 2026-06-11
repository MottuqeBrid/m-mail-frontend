import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { MdEmail, MdLock, MdPerson } from "react-icons/md";

const SignupPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card bg-base-200 w-full max-w-sm shrink-0 shadow-md">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-center">Sign up</h2>

          <div className="tabs tabs-bordered mb-4 justify-center">
            <Link to="/login" className="tab tab-bordered">Login</Link>
            <span className="tab tab-bordered tab-active">Sign up</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <label className="form-control">
              <span className="label-text">Name</span>
              <div className="join w-full">
                <span className="join-item flex items-center px-3 bg-base-300 text-base-content/60">
                  <MdPerson />
                </span>
                <input
                  type="text"
                  className="input input-bordered join-item flex-1"
                  {...register("name", { required: "Name is required" })}
                />
              </div>
              {errors.name && <span className="text-error text-sm mt-1">{errors.name.message}</span>}
            </label>

            <label className="form-control">
              <span className="label-text">Email</span>
              <div className="join w-full">
                <span className="join-item flex items-center px-3 bg-base-300 text-base-content/60">
                  <MdEmail />
                </span>
                <input
                  type="email"
                  className="input input-bordered join-item flex-1"
                  {...register("email", { required: "Email is required" })}
                />
              </div>
              {errors.email && <span className="text-error text-sm mt-1">{errors.email.message}</span>}
            </label>

            <label className="form-control">
              <span className="label-text">Password</span>
              <div className="join w-full">
                <span className="join-item flex items-center px-3 bg-base-300 text-base-content/60">
                  <MdLock />
                </span>
                <input
                  type="password"
                  className="input input-bordered join-item flex-1"
                  {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
                />
              </div>
              {errors.password && <span className="text-error text-sm mt-1">{errors.password.message}</span>}
            </label>

            <button className="btn btn-primary mt-2">Create account</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
