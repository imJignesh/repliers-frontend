import IcoEmptyListings from '@icons/IcoEmptyListings'

import { EmptyTemplate } from '.'

const EmptyBuildings = () => {
    return (
        <EmptyTemplate
            icon={<IcoEmptyListings />}
            title="No buildings found."
        >
            We couldn't find any buildings in this area.
        </EmptyTemplate>
    )
}

export default EmptyBuildings
