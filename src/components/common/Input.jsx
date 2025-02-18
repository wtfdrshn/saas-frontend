const Input = ({ field, form: { touched, errors }, label, type = 'text', ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      <input
        {...field}
        {...props}
        type={type}
        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
          touched[field.name] && errors[field.name] ? 'border-red-500' : ''
        }`}
      />
      {touched[field.name] && errors[field.name] && (
        <p className="text-red-500 text-xs italic">{errors[field.name]}</p>
      )}
    </div>
  );
};

export default Input; 