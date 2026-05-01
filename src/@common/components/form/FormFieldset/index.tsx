import { GenericHTMLFormElement } from "axios";
import { Loader2 } from "lucide-react";
import { FC } from "react";

interface FormFieldsetProps extends React.HTMLAttributes<GenericHTMLFormElement> {
    isLoading?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
}

export const FormFieldset: FC<FormFieldsetProps> = ({ children, isLoading, disabled, ...props }) => (
    <fieldset className="space-y-4">
        {isLoading ? (
            <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        ) : (
            <form {...props}>
                <fieldset disabled={disabled} className="space-y-4">
                    {children}
                </fieldset>
            </form>
        )}
    </fieldset>
);