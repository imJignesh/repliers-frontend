import React from 'react'
import Image from 'next/image'

import { Box, Container, Link, Stack, Typography } from '@mui/material'

import content from '@configs/content'
import routes from '@configs/routes'

import { toRem } from 'utils/theme'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import TwitterIcon from '@mui/icons-material/Twitter'
import PinterestIcon from '@mui/icons-material/Pinterest'
import YouTubeIcon from '@mui/icons-material/YouTube'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

const { siteName, siteFooterDescription, siteFooterLogo: logo } = content



const Footer = () => {
  return (
    <Box bgcolor="#000" py={{ xs: 4, sm: 5, md: 6 }} px={{ xs: 2, sm: 3 }} className="footer">
      <Container maxWidth="lg">
        <Stack spacing={{ xs: 4, md: 2 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 3, sm: 4, md: 9, lg: 12 }}
            width="100%"
          >
            <Stack
              py={2}
              direction={{ xs: 'column', sm: 'row' }}
              flexWrap="wrap"
              sx={{ flex: 1 }}
              spacing={{ xs: 3, sm: 3, md: 4 }}
            >
              <Box sx={{ flex: { xs: '100%', sm: '1' }, minWidth: { xs: '100%', sm: '200px' } }}>
                <Stack direction="column" spacing={2} alignItems="start">
                  <Typography
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: { xs: '14px', sm: '16px', md: '18px' },
                      width: '100%',
                      color: '#fff',
                      borderBottom: '2px solid #fff',
                      display: 'block',
                      pb: 0.5,
                      letterSpacing: '0.1rem'
                    }}
                  >
                    AS SEEN IN
                  </Typography>
                  <Image
                    unoptimized
                    alt={siteName}
                    src={`https://precondo.ca/wp-content/uploads/2023/04/seenon.png`}
                    width={250}
                    height={113}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxWidth: '250px'
                    }}
                  />
                </Stack>
              </Box>

              <Box
                sx={{
                  flex: { xs: '100%', sm: '1' },
                  minWidth: { xs: '100%', sm: '200px' },
                  color: 'text.hint',
                  fontSize: { xs: toRem(12), sm: toRem(13), md: toRem(14) }
                }}
              >
                <Stack spacing={1}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: { xs: '14px', sm: '16px', md: '18px' },
                      width: '100%',
                      color: '#fff',
                      borderBottom: '2px solid #fff',
                      display: 'block',
                      pb: 0.5,
                      letterSpacing: '0.1rem'
                    }}
                  >
                    FOLLOW US
                  </Typography>
                  <ul id="menu-social-media" className="menu">
                    <li>
                      <a target="_blank" href="https://www.facebook.com/precondo/" rel="noopener">
                        <FacebookIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
                        <span>Facebook</span>
                      </a>
                    </li>
                    <li>
                      <a target="_blank" href="https://www.instagram.com/precondo.ca/" rel="noopener">
                        <InstagramIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
                        <span>Instagram</span>
                      </a>
                    </li>
                    <li>
                      <a target="_blank" href="https://twitter.com/precondo_ca" rel="noopener">
                        <TwitterIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
                        <span>Twitter</span>
                      </a>
                    </li>
                    <li>
                      <a target="_blank" href="https://www.pinterest.ca/precondo_ca/" rel="noopener">
                        <PinterestIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
                        <span>Pinterest</span>
                      </a>
                    </li>
                    <li>
                      <a href="https://www.youtube.com/c/Precondo?sub_confirmation=1">
                        <YouTubeIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
                        <span>YouTube</span>
                      </a>
                    </li>
                  </ul>
                </Stack>
              </Box>
              <Box
                sx={{
                  flex: { xs: '100%', sm: '1' },
                  minWidth: { xs: '100%', sm: '200px' },
                  color: 'text.hint',
                  fontSize: { xs: toRem(12), sm: toRem(13), md: toRem(14) }
                }}
              >
                <Stack spacing={1}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: { xs: '14px', sm: '16px', md: '18px' },
                      width: '100%',
                      color: '#fff',
                      borderBottom: '2px solid #fff',
                      display: 'block',
                      pb: 0.5,
                      letterSpacing: '0.1rem'
                    }}
                  >
                    USEFUL LINKS
                  </Typography>
                  <ul id="menu-footer" className="menu">
                    <li id="menu-item-35535" className="menu-item">
                      <a href="https://precondo.ca/news/">
                        <ChevronRightIcon sx={{ fontSize: { xs: 14, md: 16 }, color: '#3889c7' }} />
                        <span className="suki-menu-item-title">News</span>
                      </a>
                    </li>
                    <li id="menu-item-848019" className="menu-item">
                      <a href="https://precondo.ca/3d-model-toronto/">
                        <ChevronRightIcon sx={{ fontSize: { xs: 14, md: 16 }, color: '#3889c7' }} />
                        <span className="suki-menu-item-title">3D Map</span>
                      </a>
                    </li>
                    <li id="menu-item-14826" className="menu-item">
                      <a href="https://precondo.ca/about-us/">
                        <ChevronRightIcon sx={{ fontSize: { xs: 14, md: 16 }, color: '#3889c7' }} />
                        <span className="suki-menu-item-title">About Us</span>
                      </a>
                    </li>
                    <li id="menu-item-820618" className="menu-item">
                      <a href="https://join.precondo.ca/recruiting/">
                        <ChevronRightIcon sx={{ fontSize: { xs: 14, md: 16 }, color: '#3889c7' }} />
                        <span className="suki-menu-item-title">Jobs</span>
                      </a>
                    </li>
                    <li id="menu-item-14827" className="menu-item">
                      <a href="https://precondo.ca/contact-us/">
                        <ChevronRightIcon sx={{ fontSize: { xs: 14, md: 16 }, color: '#3889c7' }} />
                        <span className="suki-menu-item-title">Contact Us</span>
                      </a>
                    </li>
                    <li id="menu-item-788932" className="menu-item">
                      <a href="https://precondo.ca/press/">
                        <ChevronRightIcon sx={{ fontSize: { xs: 14, md: 16 }, color: '#3889c7' }} />
                        <span className="suki-menu-item-title">Press</span>
                      </a>
                    </li>
                    <li id="menu-item-14828" className="menu-item">
                      <a href="https://precondo.ca/terms-of-service/">
                        <ChevronRightIcon sx={{ fontSize: { xs: 14, md: 16 }, color: '#3889c7' }} />
                        <span className="suki-menu-item-title">Terms of Service</span>
                      </a>
                    </li>
                    <li id="menu-item-14829" className="menu-item">
                      <a href="https://precondo.ca/privacy-policy/">
                        <ChevronRightIcon sx={{ fontSize: { xs: 14, md: 16 }, color: '#3889c7' }} />
                        <span className="suki-menu-item-title">Privacy Policy</span>
                      </a>
                    </li>
                    <li id="menu-item-sitemap" className="menu-item">
                      <a href="/r/sitemap">
                        <ChevronRightIcon sx={{ fontSize: { xs: 14, md: 16 }, color: '#3889c7' }} />
                        <span className="suki-menu-item-title">Sitemap</span>
                      </a>
                    </li>
                  </ul>
                </Stack>
              </Box>
              <Box
                sx={{
                  flex: { xs: '100%', sm: '1' },
                  minWidth: { xs: '100%', sm: '200px' },
                  color: 'text.hint',
                  fontSize: { xs: toRem(12), sm: toRem(13), md: toRem(14) }
                }}
              >
                <Stack spacing={1}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: { xs: '14px', sm: '16px', md: '18px' },
                      width: '100%',
                      color: '#fff',
                      borderBottom: '2px solid #fff',
                      display: 'block',
                      pb: 0.5,
                      letterSpacing: '0.1rem'
                    }}
                  >
                    Contact Us
                  </Typography>
                  <div className="textwidget custom-html-widget">
                    <div>
                      <LocationOnIcon sx={{ fontSize: { xs: 16, md: 18 } }} />
                      <a target="_blank" href="https://g.co/kgs/cZJ39he" rel="noopener">
                        100 - 300 North Queen Street Toronto, ON M9C 5K4
                      </a>
                    </div>
                    <div>
                      <PhoneIcon sx={{ fontSize: { xs: 16, md: 18 } }} />
                      +1 416-203-2715
                    </div>
                    <div>
                      <EmailIcon sx={{ fontSize: { xs: 16, md: 18 } }} />
                      support@precondo.ca
                    </div>
                    <Image
                      width={82}
                      height={60}
                      src="https://precondo.ca/wp-content/uploads/2023/04/iRise-Logo-White.png"
                      alt="iRise"
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxWidth: '82px',
                        marginTop: '8px'
                      }}
                    />
                  </div>
                </Stack>
              </Box>
            </Stack>
          </Stack>
          <Stack spacing={2}>
            <Typography
              textAlign="center"
              variant="caption"
              sx={{
                color: '#ccc',
                fontSize: { xs: '12px', sm: '13px', md: '14px' }
              }}
            >
              All rights reserved {new Date().getFullYear()} &copy; {siteName} by Precondo. <br />
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

export default Footer
