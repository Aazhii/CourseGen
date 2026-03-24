package com.aicourse.filter;

import com.aicourse.service.JWT.JWTService;
import com.aicourse.service.UserDetailService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

@Component
public class JWTFilter extends OncePerRequestFilter {

    private static final Logger LOGGER = Logger.getLogger(JWTFilter.class.getName());

    @Autowired
    private JWTService jwtService;

    @Autowired
    private ApplicationContext context;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // 🔹 No JWT → let OAuth session handle it
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();
        LOGGER.log(Level.FINE, "JWTFilter: Extracted Token: [{0}...]",
                new Object[]{token.substring(0, Math.min(token.length(), 10))});
        String username;

        try {
            username = jwtService.extractUserName(token);
        } catch (ExpiredJwtException e) {
            LOGGER.log(Level.INFO, "JWTFilter: Token expired: {0}", new Object[]{e.getMessage()});
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"JWT expired. Please login again.\"}");
            return;
        } catch (JwtException | IllegalArgumentException e) {
            LOGGER.log(Level.WARNING, "JWTFilter: Invalid token: {0}", new Object[]{e.getMessage()});
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"Invalid JWT token.\"}");
            return;
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            try {
                UserDetails userDetails = context.getBean(UserDetailService.class).loadUserByUsername(username);

                if (jwtService.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    LOGGER.log(Level.FINE, "JWTFilter: Authentication successful for user {0}",
                            new Object[]{username});
                } else {
                    LOGGER.log(Level.WARNING, "JWTFilter: Token invalid for user {0}", new Object[]{username});
                }
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, "JWTFilter: Authentication failed for user {0}: {1}",
                        new Object[]{username, e.getMessage()});
            }
        }

        filterChain.doFilter(request, response);
    }

}
