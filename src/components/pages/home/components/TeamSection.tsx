'use client'

import { useTranslations } from 'next-intl'
import { Box, Typography, Button, Grid, Avatar, Card } from '@mui/material'

// Note: Ensure your local paths for these imports are correct
import defaultLocation from '@configs/location'
import { StatsWidgets } from '@shared/Stats'
import { useFeatures } from 'providers/FeaturesProvider'
import { FeaturedProperties, HomePageBanner } from './components'
import { PopularSearches } from '@pages/catalog/components'

const teamMembers = [
    {
        name: 'JORDON SCRINKO',
        role: 'Managing Partner',
        image: 'https://precondo.ca/wp-content/uploads/2023/02/cdxvXI16_400x400.jpg', // Replace with actual paths
    },
    {
        name: 'KYLE MURDOCK',
        role: 'Managing Partner',
        image: 'https://precondo.ca/wp-content/uploads/2023/02/kyle-murdock.jpg',
    },
    {
        name: 'TARIK GIDAMY',
        role: 'Broker Of Record & Managing Partner',
        image: 'https://precondo.ca/wp-content/uploads/2023/02/tarik-gidamy-.jpg',
    },
]

export default function TeamSection() {
    const t = useTranslations('HomePage') // Assuming your translation keys are here

    return (
        <Box sx={{ py: 0, px: 0, backgroundColor: '', textAlign: 'center' }}>
            <Typography
                variant="h3"
                sx={{
                    fontWeight: 700,
                    color: '#555',
                    textAlign: 'left',
                    maxWidth: '1200px',
                    margin: '0 auto 40px',
                }}
            >
                The Precondo Team
            </Typography>

            <Grid container spacing={4} justifyContent="center" sx={{ maxWidth: '1240px', margin: '0 auto' }}>
                {teamMembers.map((member, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card
                            elevation={0}
                            sx={{
                                p: 4,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
                                borderRadius: '4px',
                            }}
                        >
                            <Avatar
                                src={member.image}
                                alt={member.name}
                                sx={{
                                    width: 180,
                                    height: 180,
                                    mb: 3,
                                    border: 'none',
                                }}
                            />
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 800, letterSpacing: '1px', mb: 1, textTransform: 'uppercase' }}
                            >
                                {member.name}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ color: '#666', lineHeight: 1.4, maxWidth: '200px' }}
                            >
                                {member.role}
                            </Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Button
                variant="contained"
                sx={{
                    mt: 12,
                    backgroundColor: '#33719e',
                    textTransform: 'uppercase',
                    padding: '12px 24px',
                    fontWeight: 600,
                    '&:hover': {
                        backgroundColor: '#285a7e',
                    },
                }}
            >
                View All Members
            </Button>
        </Box>
    )
}