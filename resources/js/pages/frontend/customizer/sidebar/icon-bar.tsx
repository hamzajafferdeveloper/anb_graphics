import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { btnSideBarLink } from '@/constant/customizer-icon-bar-data';
import { setSelectedSidebar } from '@/stores/customizer/customizerSlice';
import { AppDispatch, RootState } from '@/stores/store';
import { useDispatch, useSelector } from 'react-redux';

const IconBar = () => {
    const dispatch = useDispatch<AppDispatch>();
    const selectedSidebar = useSelector(
        (state: RootState) => state.customizer.selectedSidebar,
    );

    return (
        <div>
            <div className="flex h-fit w-full items-center gap-1 rounded-xl border p-1 shadow-2xl lg:h-full lg:w-auto lg:flex-col">
                {btnSideBarLink.map((btn, index) => {
                    const isActive = selectedSidebar === btn.name;

                    return (
                        <Tooltip key={index}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={isActive ? 'default' : 'ghost'}
                                    className={`relative !h-8 !w-8 cursor-pointer overflow-hidden rounded-md p-2 transition-all duration-300 md:!h-10 md:!w-10 ${
                                        isActive
                                            ? `border border-white/30 bg-primary shadow-[0_8px_32px_rgba(255,255,255,0.18)] backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-0 before:rounded-md before:bg-gradient-to-br before:from-white/40 before:via-white/10 before:to-transparent before:opacity-60`
                                            : 'hover:bg-white/10'
                                    }`}
                                    asChild
                                    onClick={() =>
                                        dispatch(setSelectedSidebar(btn.name))
                                    }
                                >
                                    <btn.icon
                                        className={` ${
                                            isActive
                                                ? 'text-white'
                                                : 'text-muted-foreground'
                                        }`}
                                    />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>{btn.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>
        </div>
    );
};

export default IconBar;
