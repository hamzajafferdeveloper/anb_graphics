import Canvas from './canvas';
import Sidebar from './sidebar/sidebar';

const Customizer = () => {
    return (
        <section className='flex gap-2'>
            <Sidebar />
            <Canvas />
        </section>
    );
};

export default Customizer;
