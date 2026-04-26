import { useEffect, useState } from "react";

interface IUseScrollObserver {
    maxScroll: number;
    scrollDirection?: "horizontal" | "vertical";
}

/**
 * Hook personalizado para observar la posición de desplazamiento y determinar si ha pasado un umbral especificado.
 *
 * @param options - Opciones de configuración para el observador de desplazamiento.
 * @param options.maxScroll - El umbral de posición de desplazamiento para determinar si se ha pasado.
 * @param options.scrollDirection - La dirección del desplazamiento a observar, ya sea "vertical" u "horizontal". Por defecto es "vertical".
 * @param ref - Objeto de referencia de React opcional que apunta al elemento a observar. Si no se proporciona, se observará el desplazamiento de la ventana.
 *
 * @returns Un objeto que contiene:
 * - `hasScrolled`: Un booleano que indica si la posición de desplazamiento ha pasado el umbral especificado.
 * - `resetScroll`: Una función para restablecer el estado de `hasScrolled` a false.
 *
 * @example
 * // Si se proporciona un ref
 * const { hasScrolled, resetScroll } = useScrollObserver({ maxScroll: 100 }, ref);
 * // Si no se proporciona un ref
 * const { hasScrolled, resetScroll } = useScrollObserver({ maxScroll: 100, scrollDirection: "horizontal" });
 */
export const useScrollObserver = (
    options: IUseScrollObserver,
    ref?: React.RefObject<HTMLElement | null>
): {
    hasScrolled: boolean;
    resetScroll: () => void;
} => {
    const { maxScroll, scrollDirection = "vertical" } = options;
    const [hasScrolledPastThreshold, setHasScrolledPastThreshold] = useState(false);

    useEffect(() => {
        const element = ref?.current;

        const handleScroll = () => {
            if (!ref) {
                const scrollPosition =
                    scrollDirection === "horizontal"
                        ? window.scrollX || document.documentElement.scrollLeft
                        : window.scrollY || document.documentElement.scrollTop;
                setHasScrolledPastThreshold(scrollPosition > maxScroll);
            } else if (element) {
                const scrollPosition = scrollDirection === "horizontal" ? element.scrollLeft : element.scrollTop;
                setHasScrolledPastThreshold(scrollPosition > maxScroll);
            }
        };

        const scrollElement = ref ? element : window;
        scrollElement?.addEventListener("scroll", handleScroll);

        return () => {
            scrollElement?.removeEventListener("scroll", handleScroll);
        };
    }, [ref?.current, maxScroll, scrollDirection]);

    return {
        hasScrolled: hasScrolledPastThreshold,
        resetScroll: () => setHasScrolledPastThreshold(false),
    };
};
