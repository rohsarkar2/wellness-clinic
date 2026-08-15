import { telHref, whatsappHref } from "@/lib/site";

const BUTTON =
  "flex size-[52px] items-center justify-center rounded-full text-[21px] text-white shadow-[0_10px_25px_rgb(0_0_0/0.2)] transition duration-300 hover:-translate-y-[5px] hover:scale-[1.08] md:size-[60px] md:text-[26px]";

export default function FloatingButtons() {
  return (
    <div className="fixed right-4 bottom-4 z-900 flex flex-col gap-3 md:right-6.25 md:bottom-6.25 md:gap-3.75">
      <a href={telHref} className={`${BUTTON} bg-primary`} aria-label="Call the clinic">
        <i className="fa-solid fa-phone" aria-hidden="true" />
      </a>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`${BUTTON} bg-[#25d366]`}
        aria-label="Chat with us on WhatsApp"
      >
        <i className="fa-brands fa-whatsapp" aria-hidden="true" />
      </a>
    </div>
  );
}
