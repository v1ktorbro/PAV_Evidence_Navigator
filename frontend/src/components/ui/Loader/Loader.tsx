import scss from "./loader.module.scss";

interface ILoader {
  label?: string;
  variant?: "page" | "inline" | "overlay";
}

const Loader = ({
  label = "Поднимаем данные из пласта…",
  variant = "inline",
}: ILoader) => (
  <div
    className={`${scss.root} ${scss[variant]}`}
    role="status"
    aria-live="polite"
  >
    <div className={scss.pumpJack} aria-hidden="true">
      <span className={scss.tower} />
      <span className={scss.beam}>
        <span className={scss.horsehead} />
      </span>
      <span className={scss.pivot} />
      <span className={scss.rod} />
      <span className={scss.well}>
        <span className={scss.oilDrop} />
      </span>
      <span className={scss.ground} />
    </div>
    <p>{label}</p>
  </div>
);

export default Loader;
