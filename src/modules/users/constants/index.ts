import { IOption } from "@/@common/types/IOption";
import { ROLE_KEYS, ROLE_LABELS } from "../services/user.service";

export const roleOptions: IOption[] = ROLE_KEYS.map((k) => ({ value: k, label: ROLE_LABELS[k] }));